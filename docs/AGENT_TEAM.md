# How the Landman Command AI Team Works

Set up 2026-11-22. The team list is `docs/expert-roster.md`; the operating rules every
agent follows are in `CLAUDE.md`. This document explains the design and how to use it.

## Design

```
You (Product Owner)
   │  plain-language requests
   ▼
Main Claude Code session = Lead Architect (CLAUDE.md)
   ├── answers small things itself
   ├── asks one expert directly for a narrow question
   ├── asks the orchestrator for questions that cross several areas
   │       └── orchestrator briefs 1 to 4 experts, runs them in parallel or in
   │           sequence, has them respond to each other, returns one answer
   └── asks the team-architect to add or improve agents and skills
```

- **31 subagents** in `.claude/agents/`: the orchestrator, the team architect, and 29
  experts in eight groups (coordination; land, title, and records; energy and
  infrastructure; GIS and mapping; data; software; quality and security; product, docs,
  and compliance).
- **31 skills** in `.claude/skills/<name>/SKILL.md`: project knowledge (Texas appraisal
  data, title basics, legal descriptions, energy sources, spatial SQL, map conventions,
  and more), procedures (tests, browser checks, migrations, releases, owner instructions),
  templates (consultation answers, proposals, delivery reports), and two commands
  (`/ask-team`, `/improve-team`).
- **Wiring:** each agent's `skills:` list preloads the skills it needs. Every expert
  preloads `expert-consultation`, so answers come back in one format the orchestrator can
  merge. Skills not preloaded can still be used on demand.
- **Memory:** experts and the team architect have `memory: project`, so each keeps lessons
  in `.claude/agent-memory/<agent>/MEMORY.md`, committed with the work.

## Agent settings and why

| Setting | Experts | Orchestrator | Team architect |
| --- | --- | --- | --- |
| Model | opus, sonnet, or haiku by role (`docs/agent-brains.md`) | opus | opus |
| Can start other agents | no (`disallowedTools: Agent`) | yes | no |
| Can edit files | builds-code experts after approval; advisers only notes under `docs/research/` | no (`Edit`, `Write` removed) | agent and skill files only |
| Memory | project | none (stateless coordinator) | project |
| Knowledge folder read before every answer | `knowledge/<agent-name>/` | `knowledge/orchestrator/` | `knowledge/team-architect/` |
| Personality | first name, voice, working style | Morgan | Theo |

Only the orchestrator and the main session delegate. That keeps coordination in one place,
prevents agents spawning agents without limit, and keeps cost predictable. Nesting depth is
at most two below the main session (main, orchestrator, expert), within Claude Code's
default limit of three.

## Ways to use it

| You want | Do this |
| --- | --- |
| Anything | Ask the main session in plain words; it routes the work |
| A combined expert answer, no changes | `/ask-team <question>` |
| One specific expert | "Have the gis-engineer look at ..." or type `@` and pick the agent |
| A proposal before building | "Proposal only, don't build anything yet" |
| A new expert or skill, or a better one | `/improve-team <request>` |
| The list of agents | `/agents` in the terminal, or `docs/expert-roster.md` |

More examples, with the experts each one brings in: `docs/how-to-talk-to-your-experts.md`.

Example questions for `/ask-team`:
- "What would it take to show transmission lines and substations near the Stamford project?"
- "How should we track solar lease options and their deadlines per landowner?"
- "Is it safe to let my coworker open the app from their laptop on the office Wi-Fi?"

## Workflow for building

Request, consultation, proposal, your approval, implementation, QA, delivery report. The
full rules, including what needs your approval, are in `CLAUDE.md`.

## Starting a new session

Open Claude Code in this repository. The session reads `CLAUDE.md` and finds the agents and
skills; nothing needs to be recreated. Cloud sessions start from `main` unless you choose
another branch, so the team must be on `main` (it is, as of 2026-11-22). Good first
messages: "Read docs/PROGRESS.md and docs/ROADMAP.md and tell me where we are", or
`/ask-team <question>`.

## Parallel work and isolation

- Consultations run in parallel freely; they change nothing.
- Implementers that run at the same time must own different files, or each runs with
  `isolation: worktree` (its own copy of the repository). A worktree starts from `main`
  unless configured otherwise, so this is only safe when `main` is current.

## Agent Teams (evaluated 2026-11-22, not enabled)

Claude Code also offers Agent Teams: several full Claude Code sessions that message each
other and share a task list (code.claude.com/docs/en/agent-teams, read 2026-11-22). They
are experimental and off by default (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings
enables them), use significantly more tokens, can form on their own once enabled, and
cannot be resumed with the session. The orchestrator gives the same "experts working
together" result through subagents at much lower cost, so teams stay off. The agent files
here can be reused as teammate definitions if you ever approve enabling them.

## Token economy

- The main session answers small things itself; one or two experts is the norm.
- Skills are short; long reference material belongs in sibling files loaded on demand.
- Total agent description text is far below Claude Code's 15,000-token startup limit.

## Changing the team

Use `/improve-team`, or edit the files directly and then update `docs/expert-roster.md`,
the routing table in `.claude/skills/expert-routing/SKILL.md`, and the team table in
`CLAUDE.md` together. Validate with `claude plugin validate .claude/agents`.
