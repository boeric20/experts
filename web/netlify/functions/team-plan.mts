// POST /api/team-plan: the orchestrator reads the question and decides which experts to bring in.
// Body: { question, history: [{ question, answer }] }
// Returns JSON: { framing, experts: [{ agent, part, why }] }
import type { Config } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { AGENTS, MODEL_IDS, ORCHESTRATOR, TEAM_CONTEXT } from "../../server/agents.mts";
import { TIME_BUDGET_MS, claude } from "../../server/claude.mts";
import { checkAccess, jsonError, readJson } from "../../server/http.mts";
import publicTeam from "../../src/generated/agents.json" with { type: "json" };

const Body = z.object({
  question: z.string().min(1).max(20_000),
  history: z.array(z.object({ question: z.string().max(20_000), answer: z.string().max(40_000) })).max(10).default([]),
});

const experts = publicTeam.agents.filter((a) => a.name !== ORCHESTRATOR);
const expertNames = new Set(experts.map((a) => a.name));

const Plan = z.object({
  framing: z.string(),
  // Agent names are checked in code below: structured outputs do not enforce an enum here.
  experts: z.array(z.object({ agent: z.string(), part: z.string(), why: z.string() })),
});

const roster = experts
  .map((a) => `- ${a.name} (${a.firstName}, ${a.role}, ${a.model}): ${a.description}`)
  .join("\n");

const PLAN_INSTRUCTIONS = `# This step: choose the experts

In this web chat you do not call experts yourself. You choose them now; the app then consults
each one in parallel with the question you write for them, and gives you their answers in the
next step to combine.

Return:
- framing: one or two sentences on what decision or answer the Product Owner needs.
- experts: the fewest experts that cover the question, usually one to three and never more than
  four. For each: agent (exact name from the list), part (a self-contained question for that
  expert: what to cover, what context matters, what to leave to others), and why (one line).
  Return an empty list only when the question is about the team itself or so simple that no
  expert adds anything; you will then answer it directly.

The experts:
${roster}`;

export default async (req: Request) => {
  const denied = checkAccess(req);
  if (denied) return denied;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await readJson(req));
  } catch {
    return jsonError(400, "The request was not in the expected format.");
  }

  const orchestrator = AGENTS[ORCHESTRATOR];
  const earlier = body.history
    .map((h, i) => `Earlier question ${i + 1}: ${h.question}\nTeam answer ${i + 1}: ${h.answer}`)
    .join("\n\n");
  const content = (earlier ? `${earlier}\n\n` : "") + `New question from the Product Owner:\n${body.question}`;

  try {
    const response = await claude().messages.parse(
      {
        model: MODEL_IDS[orchestrator.model],
        max_tokens: 3000,
        system: [
          { type: "text", text: TEAM_CONTEXT },
          { type: "text", text: orchestrator.system, cache_control: { type: "ephemeral" } },
          { type: "text", text: PLAN_INSTRUCTIONS },
        ],
        messages: [{ role: "user", content }],
        output_config: { effort: "medium", format: zodOutputFormat(Plan) },
      },
      { timeout: TIME_BUDGET_MS },
    );
    if (response.stop_reason === "refusal") return jsonError(422, "The orchestrator declined this question.");
    const plan = response.parsed_output;
    if (!plan) return jsonError(502, "The orchestrator's plan could not be read. Try again.");
    const seen = new Set<string>();
    const chosen = plan.experts
      .map((e) => ({ ...e, agent: e.agent.trim() }))
      .filter((e) => expertNames.has(e.agent) && !seen.has(e.agent) && seen.add(e.agent))
      .slice(0, 4);
    return Response.json({ framing: plan.framing, experts: chosen }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return jsonError(502, "The Claude API rejected the API key. Check ANTHROPIC_API_KEY in Netlify.");
    if (err instanceof Anthropic.RateLimitError) return jsonError(429, "The Claude API rate limit was reached. Wait a minute and try again.");
    if (err instanceof Anthropic.APIError) return jsonError(502, `Claude API error ${err.status ?? ""}: ${err.message}`);
    return jsonError(500, err instanceof Error ? err.message : "Planning failed.");
  }
};

export const config: Config = { path: "/api/team-plan" };
