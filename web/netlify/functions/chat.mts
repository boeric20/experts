// POST /api/chat: one expert answers, streamed back as newline-delimited JSON.
//   mode "chat":    { agent, mode, messages: [{ role, content }], webSearch }
//   mode "consult": { agent, mode, question, part, framing, webSearch }  (the orchestrator consulting an expert)
import type { Config } from "@netlify/functions";
import { z } from "zod";
import { ORCHESTRATOR, getAgent } from "../../server/agents.mts";
import { streamReply, type ChatTurn } from "../../server/claude.mts";
import { checkAccess, jsonError, ndjsonResponse, readJson } from "../../server/http.mts";

const Turn = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(20_000) });
const ChatBody = z.object({
  mode: z.literal("chat"),
  agent: z.string(),
  messages: z.array(Turn).min(1).max(40),
  webSearch: z.boolean().default(false),
});
const ConsultBody = z.object({
  mode: z.literal("consult"),
  agent: z.string(),
  question: z.string().min(1).max(20_000),
  part: z.string().min(1).max(4_000),
  framing: z.string().max(4_000).default(""),
  webSearch: z.boolean().default(false),
});
const Body = z.discriminatedUnion("mode", [ChatBody, ConsultBody]);

export default async (req: Request) => {
  const denied = checkAccess(req);
  if (denied) return denied;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await readJson(req));
  } catch {
    return jsonError(400, "The request was not in the expected format.");
  }
  const agent = getAgent(body.agent);
  if (!agent || body.agent === ORCHESTRATOR) return jsonError(400, `Unknown expert: ${body.agent}`);

  if (body.mode === "chat") {
    const turns: ChatTurn[] = body.messages;
    if (turns[0].role !== "user" || turns[turns.length - 1].role !== "user") {
      return jsonError(400, "A conversation must start and end with a message from you.");
    }
    return ndjsonResponse((emit) => streamReply(emit, agent, turns, { maxTokens: 8000, webSearch: body.webSearch }).then(() => {}));
  }

  const brief =
    `The orchestrator, Morgan, is consulting you on a question from the Product Owner. This is a consultation: ` +
    `answer in the expert-consultation format, in about 400 words or fewer.\n\n` +
    `Product Owner's question:\n${body.question}\n\n` +
    (body.framing ? `How the orchestrator framed it:\n${body.framing}\n\n` : "") +
    `Your part:\n${body.part}`;
  return ndjsonResponse((emit) =>
    streamReply(emit, agent, [{ role: "user", content: brief }], { maxTokens: 4000, webSearch: body.webSearch }).then(() => {}),
  );
};

export const config: Config = { path: "/api/chat" };

