// Calls to the Claude API. Runs only inside Netlify Functions; the API key comes from the
// ANTHROPIC_API_KEY environment variable and never reaches the browser.
import Anthropic from "@anthropic-ai/sdk";
import { MODEL_IDS, TEAM_CONTEXT, type AgentPrompt, type ModelAlias } from "./agents.mts";
import { describeError, type Emit } from "./http.mts";

// Netlify stops a function after 60 seconds, so every call ends on its own a little before that.
export const TIME_BUDGET_MS = 52_000;

let client: Anthropic | null = null;
export function claude(): Anthropic {
  // The key is read explicitly so no other credential on the machine is ever used.
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: TIME_BUDGET_MS });
  return client;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

const EFFORT: Record<ModelAlias, "low" | "medium"> = { opus: "medium", sonnet: "medium", haiku: "low" };

// Refusal fallbacks: on a policy decline the API re-runs the request on a fallback model.
// Server-side fallbacks are available for the Opus and Sonnet models used here, not Haiku.
function fallbackParams(model: ModelAlias) {
  if (model === "haiku") return {};
  return { betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[], fallbacks: "default" as const };
}

function webSearchTool(model: ModelAlias, maxUses: number): Anthropic.Beta.BetaToolUnion {
  // The dynamic-filtering web search variant needs Opus or Sonnet; Haiku uses the basic one.
  return model === "haiku"
    ? { type: "web_search_20250305", name: "web_search", max_uses: maxUses }
    : { type: "web_search_20260209", name: "web_search", max_uses: maxUses };
}

// System prompt: the shared web-chat context, then the agent's own prompt (cached).
function systemBlocks(agent: AgentPrompt, extra?: string): Anthropic.Beta.BetaTextBlockParam[] {
  const blocks: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: TEAM_CONTEXT },
    { type: "text", text: agent.system, cache_control: { type: "ephemeral" } },
  ];
  if (extra) blocks.push({ type: "text", text: extra });
  return blocks;
}

// Conversation for the API. PDF knowledge documents go at the start of the first user message,
// which never changes during a conversation, so they stay in the cached prefix.
function apiMessages(agent: AgentPrompt, turns: ChatTurn[]): Anthropic.Beta.BetaMessageParam[] {
  return turns.map((turn, i) => {
    if (i !== 0 || agent.pdfs.length === 0) return { role: turn.role, content: turn.content };
    const docs: Anthropic.Beta.BetaContentBlockParam[] = agent.pdfs.map((pdf, j) => ({
      type: "document",
      title: pdf.title,
      source: { type: "base64", media_type: "application/pdf", data: pdf.data },
      ...(j === agent.pdfs.length - 1 ? { cache_control: { type: "ephemeral" as const } } : {}),
    }));
    return { role: "user", content: [...docs, { type: "text", text: turn.content }] };
  });
}

export interface ReplyOptions {
  maxTokens: number;
  webSearch: boolean;
  extraSystem?: string;
}

// Stream one agent's reply to the browser. Handles web search pauses, refusals, the time limit,
// and reports token use at the end. Returns the full text of the reply.
export async function streamReply(emit: Emit, agent: AgentPrompt, turns: ChatTurn[], opts: ReplyOptions): Promise<string> {
  const model = agent.model;
  const messages = apiMessages(agent, turns);
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIME_BUDGET_MS);
  const usage = { input: 0, output: 0, cacheRead: 0 };
  const sources = new Map<string, string>();
  let text = "";
  let servedBy: string = MODEL_IDS[model];

  try {
    // A long web search can pause the turn; send it back so the server continues (at most 3 times).
    for (let round = 0; round < 4; round++) {
      emit({ type: "status", text: round === 0 ? "Thinking" : "Continuing after a web search" });
      const stream = claude().beta.messages.stream(
        {
          model: MODEL_IDS[model],
          max_tokens: opts.maxTokens,
          system: systemBlocks(agent, opts.extraSystem),
          messages,
          output_config: { effort: EFFORT[model] },
          ...(opts.webSearch ? { tools: [webSearchTool(model, 3)] } : {}),
          ...fallbackParams(model),
        },
        { signal: abort.signal },
      );

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          const block = event.content_block;
          if (block.type === "server_tool_use") emit({ type: "status", text: "Searching the web" });
          else if (block.type === "thinking") emit({ type: "status", text: "Thinking" });
          else if (block.type === "text") emit({ type: "status", text: "Writing" });
        } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          text += event.delta.text;
          emit({ type: "text", text: event.delta.text });
        }
      }

      const message = await stream.finalMessage();
      servedBy = message.model;
      usage.input += message.usage.input_tokens;
      usage.output += message.usage.output_tokens;
      usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;

      for (const block of message.content) {
        if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
          for (const r of block.content) if (r.type === "web_search_result") sources.set(r.url, r.title);
        } else if (block.type === "fallback") {
          emit({ type: "notice", text: `${block.from.model} declined this request; ${block.to.model} answered instead.` });
        }
      }

      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }
      if (message.stop_reason === "refusal") {
        emit({ type: "notice", text: "Claude declined to answer this request." });
      } else if (message.stop_reason === "max_tokens") {
        emit({ type: "notice", text: "The answer reached its length limit and was cut off. Ask for the rest, or ask a narrower question." });
      }
      break;
    }
  } catch (err) {
    if (abort.signal.aborted) {
      emit({
        type: "notice",
        text: "Stopped at the time limit (Netlify allows about 60 seconds per answer). Ask a narrower question, or turn off web search.",
      });
    } else if (err instanceof Anthropic.AuthenticationError) {
      emit({ type: "error", text: "The Claude API rejected the API key. Check ANTHROPIC_API_KEY in Netlify." });
    } else if (err instanceof Anthropic.RateLimitError) {
      emit({ type: "error", text: "The Claude API rate limit was reached. Wait a minute and try again." });
    } else if (err instanceof Anthropic.BadRequestError) {
      emit({ type: "error", text: `The Claude API refused the request: ${err.message}` });
    } else if (err instanceof Anthropic.APIError) {
      emit({ type: "error", text: `Claude API error ${err.status ?? ""}: ${err.message}` });
    } else {
      emit({ type: "error", text: describeError(err) });
    }
  } finally {
    clearTimeout(timer);
  }

  if (sources.size) emit({ type: "sources", items: [...sources].map(([url, title]) => ({ url, title })) });
  emit({ type: "done", model: servedBy, usage });
  return text;
}
