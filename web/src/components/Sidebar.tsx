import { useState } from "react";
import { ORCHESTRATOR, groupedExperts } from "../lib/team";
import { ModelBadge } from "./ModelBadge";

export const TEAM_KEY = "__team__";

interface Props {
  selected: string;
  onSelect: (key: string) => void;
}

export function Sidebar({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState("");
  const groups = groupedExperts(filter);
  return (
    <nav className="sidebar" aria-label="Experts">
      <button
        className={`team-entry ${selected === TEAM_KEY ? "active" : ""}`}
        onClick={() => onSelect(TEAM_KEY)}
        aria-current={selected === TEAM_KEY ? "page" : undefined}
      >
        <span className="team-title">Ask the whole team</span>
        <span className="team-sub">
          {ORCHESTRATOR.firstName}, the orchestrator, picks the experts and combines their answers <ModelBadge model={ORCHESTRATOR.model} />
        </span>
      </button>

      <input
        className="filter"
        type="search"
        placeholder="Find an expert"
        aria-label="Find an expert"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {groups.length === 0 && <p className="muted small pad">No expert matches.</p>}
      {groups.map(({ group, agents }) => (
        <section key={group} className="group">
          <h2>{group}</h2>
          <ul>
            {agents.map((a) => (
              <li key={a.name}>
                <button
                  className={`agent ${selected === a.name ? "active" : ""}`}
                  onClick={() => onSelect(a.name)}
                  aria-current={selected === a.name ? "page" : undefined}
                  title={`${a.firstName}, ${a.role}\nVoice: ${a.voice}\nWorking style: ${a.workingStyle}`}
                >
                  <span className="agent-top">
                    <span className="agent-name">{a.firstName}</span>
                    <ModelBadge model={a.model} />
                  </span>
                  <span className="agent-role">{a.role}</span>
                  <span className="agent-voice">{a.voice}</span>
                  <span className="agent-style">{a.workingStyle}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
