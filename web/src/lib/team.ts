import data from "../generated/agents.json";

export type ModelAlias = "opus" | "sonnet" | "haiku";

export interface Agent {
  name: string;
  firstName: string;
  role: string;
  model: ModelAlias;
  voice: string;
  workingStyle: string;
  description: string;
  group: string;
  knowledgeFiles: string[];
}

export const TEAM = data as { orchestrator: string; groupOrder: string[]; agents: Agent[] };
export const ORCHESTRATOR = TEAM.agents.find((a) => a.name === TEAM.orchestrator)!;
export const EXPERTS = TEAM.agents.filter((a) => a.name !== TEAM.orchestrator);
export const BY_NAME = new Map(TEAM.agents.map((a) => [a.name, a]));

export const MODEL_LABEL: Record<ModelAlias, string> = { opus: "Opus", sonnet: "Sonnet", haiku: "Haiku" };

// Experts grouped for the sidebar, in the configured order.
export function groupedExperts(filter: string): { group: string; agents: Agent[] }[] {
  const f = filter.trim().toLowerCase();
  const match = (a: Agent) =>
    !f || [a.firstName, a.role, a.name, a.voice, a.workingStyle, a.description, a.model].some((s) => s.toLowerCase().includes(f));
  const groups = new Map<string, Agent[]>();
  for (const a of EXPERTS.filter(match)) groups.set(a.group, [...(groups.get(a.group) ?? []), a]);
  const order = (g: string) => {
    const i = TEAM.groupOrder.indexOf(g);
    return i < 0 ? 999 : i;
  };
  return [...groups].sort((x, y) => order(x[0]) - order(y[0])).map(([group, agents]) => ({ group, agents }));
}
