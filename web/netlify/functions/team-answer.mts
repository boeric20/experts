// POST /api/team-answer: the orchestrator combines the experts' answers into one, streamed.
// Body: { question, framing, consultations: [{ agent, part, answer }], history: [{ question, answer }] }
import type { Config } from "@netlify/functions";
import { z } from "zod";
import { AGENTS, ORCHESTRATOR } from "../../server/agents.mts";
import { streamReply } from "../../server/claude.mts";
import { checkAccess, jsonError, ndjsonResponse, readJson } from "../../server/http.mts";
import publicTeam from "../../src/generated/agents.json" with { type: "json" };

const Body = z.object({
  question: z.string().min(1).max(20_000),
  framing: z.string().max(4_000).default(""),
  consultations: z
    .array(z.object({ agent: z.string(), part: z.string().max(4_000), answer: z.string().max(40_000) }))
    .max(4),
  history: z.array(z.object({ question: z.string().max(20_000), answer: z.string().max(40_000) })).max(10).default([]),
});

const byName = new Map(publicTeam.agents.map((a) => [a.name, a]));

const ANSWER_INSTRUCTIONS = `# This step: combine the experts' answers

The experts you chose have answered; their answers are in the message. Write one combined answer
for the Product Owner in your answer format (Answer, Why, Where the experts disagreed, Risks and
limits, Decisions for you, Experts consulted), omitting sections that are empty. Keep every
caveat that matters, carry "unverified" labels through, and do not invent agreement that did not
happen. If an expert's answer is missing or cut off, say so. If no experts were consulted, answer
the question directly and say that no experts were needed. Sign off as Morgan, Orchestrator.`;

export default async (req: Request) => {
  const denied = checkAccess(req);
  if (denied) return denied;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await readJson(req));
  } catch {
    return jsonError(400, "The request was not in the expected format.");
  }

  const earlier = body.history
    .map((h, i) => `Earlier question ${i + 1}: ${h.question}\nTeam answer ${i + 1}: ${h.answer}`)
    .join("\n\n");
  const answers = body.consultations
    .map((c) => {
      const a = byName.get(c.agent);
      const who = a ? `${a.firstName} (${c.agent}, ${a.role})` : c.agent;
      return `## ${who}\nAsked: ${c.part}\n\n${c.answer.trim() || "(no answer: the call failed or timed out)"}`;
    })
    .join("\n\n");
  const content =
    (earlier ? `${earlier}\n\n` : "") +
    `Product Owner's question:\n${body.question}\n\n` +
    (body.framing ? `Your framing:\n${body.framing}\n\n` : "") +
    (answers ? `Expert answers:\n\n${answers}` : "No experts were consulted.");

  return ndjsonResponse((emit) =>
    streamReply(emit, AGENTS[ORCHESTRATOR], [{ role: "user", content }], {
      maxTokens: 6000,
      webSearch: false,
      extraSystem: ANSWER_INSTRUCTIONS,
    }).then(() => {}),
  );
};

export const config: Config = { path: "/api/team-answer" };
