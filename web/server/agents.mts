// The expert team as the Netlify Functions see it: full prompts and knowledge documents,
// generated at build time by scripts/build-agents.mjs. Never imported by browser code.
import data from "./generated/agent-prompts.json" with { type: "json" };

export type ModelAlias = "opus" | "sonnet" | "haiku";

export interface AgentPrompt {
  model: ModelAlias;
  system: string;
  pdfs: { title: string; data: string }[];
}

const prompts = data as { teamContext: string; agents: Record<string, AgentPrompt> };

export const TEAM_CONTEXT = prompts.teamContext;
export const AGENTS = prompts.agents;
export const ORCHESTRATOR = "orchestrator";

// Model alias in each agent file -> current Claude model ID.
export const MODEL_IDS: Record<ModelAlias, string> = {
  opus: "claude-opus-5-5",
  sonnet: "claude-sonnet-5-5",
  haiku: "claude-haiku-5-5",
};

export function getAgent(name: unknown): AgentPrompt | null {
  if (typeof name !== "string" || !Object.hasOwn(AGENTS, name)) return null;
  return AGENTS[name];
}
