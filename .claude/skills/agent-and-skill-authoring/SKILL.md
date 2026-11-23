---
name: agent-and-skill-authoring
description: How to write and maintain Claude Code subagents (.claude/agents/*.md) and skills (.claude/skills/<name>/SKILL.md) for this project - file formats, frontmatter fields, conventions, wiring, and validation. Used by the team architect.
---
# Authoring agents and skills

Official references (re-read when a field or behaviour is in doubt):
- Subagents: https://code.claude.com/docs/en/sub-agents
- Skills: https://code.claude.com/docs/en/skills

## Subagent file: `.claude/agents/<name>.md`
- Starts with `---` on line 1. Required: `name` (lowercase, hyphens, no `:`), `description` (when to delegate; short; trigger words first).
- Fields used in this project: `model` (`opus`, `sonnet`, or `haiku`; see below), `memory: project`, `color`, `skills` (list of skill names to preload, max 32), `disallowedTools`.
- Choosing the model: `opus` for deep strategy, legal, or financial judgment; `sonnet` for most specialist work; `haiku` only for fast, simple lookups whose judgment calls are handed to another agent. Record the choice and reason in `docs/agent-brains.md`.
- Experts get `disallowedTools: Agent` so only the orchestrator and the main session delegate.
- Field names are camelCase and must match exactly; unknown fields are ignored silently.
- The body is the agent's system prompt. Structure used here: role and mission; "Who you are" (a first name not used by another agent, a voice, a working style, sign-off line); "Your knowledge folder" (read `knowledge/<name>/` before every answer); expertise; what you own; rules for this role; how you work (consultation vs approved implementation); memory note. Copy these sections from an existing agent and change the specifics.
- Agents load `CLAUDE.md`; do not repeat project-wide rules in the body.

## Skill: `.claude/skills/<name>/SKILL.md`
- Folder name is the command name. Frontmatter: `name`, `description` (what and when, key use first; listing truncates near 1,536 characters).
- Optional fields used here: `user-invocable: false` (background knowledge), `disable-model-invocation: true` (manual commands only; such a skill cannot be preloaded into agents), `argument-hint`, `context: fork` with `agent: <name>` and `background: false` (run as that agent with `$ARGUMENTS`).
- Keep the body short: it stays in context once loaded. Put long reference material in a sibling file and link it.

## When adding or changing
1. Check `docs/expert-roster.md` and `.claude/agents/` for overlap. Prefer improving an existing agent over adding a near-duplicate.
2. Write or edit the files.
3. Wire skills: list them under the agent's `skills`. Every listed skill must exist and must not set `disable-model-invocation: true`.
4. Create `knowledge/<name>/README.md` saying what documents belong there (copy an existing README's layout). Update `docs/expert-roster.md`, `docs/agent-brains.md` (model, reason, name, voice, working style), the routing table in `.claude/skills/expert-routing/SKILL.md`, and the team table in `CLAUDE.md`.
5. Validate:
   - `claude plugin validate .claude/agents`
   - `claude plugin validate .claude/skills` (if supported by the installed version)
   - A check that every name in every `skills:` list has a folder in `.claude/skills/`.
6. Report each file created or changed and the validation output.

## Limits
- Keep the team between 10 and 50 agents; above that, merge.
- Never give an agent rights the roles do not need. Never remove the approval rules in `CLAUDE.md`.
- Total agent description text must stay well under Claude Code's 15,000-token startup limit.
