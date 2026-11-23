# Ask Ruth from the command line

A small Node.js script that uses the [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) to load Ruth, the Texas title research agent, ask her one question, and print her answer.

## How it works

- Ruth is defined in `../.claude/agents/ruth.md`. Her knowledge folder is `../.claude/agents/ruth-knowledge/` (agent guide, research notes, and topic notes).
- The script runs the SDK with `cwd` set to the repository root and `settingSources: ["project"]`, so the SDK loads agents from the project's `.claude/agents/` folder ([subagents docs](https://code.claude.com/docs/en/agent-sdk/subagents)).
- It sets `agent: "ruth"`, so the main conversation runs as Ruth with her system prompt and tool list. Her answer is printed as she wrote it, not summarized by another agent.
- Ruth may use `Read`, `Glob`, `Grep`, `WebSearch` and `WebFetch` without a prompt. She cannot edit files or run shell commands.
- The answer goes to stdout. Tool activity (`[ruth] WebSearch ...`) goes to stderr.

## Requirements

- Node.js 18.14 or later.
- An Anthropic API key from https://console.anthropic.com.

The SDK installs a bundled Claude Code binary as an optional dependency. Do not install with `--omit=optional`, or the SDK will report `Native CLI binary for <platform>-<arch> not found`.

## Install

From the repository root:

```bash
cd sdk
```

```bash
npm install
```

## Set your API key

macOS or Linux:

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Windows PowerShell:

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"
```

The SDK reads the key from the environment. It does not load `.env` files. Do not commit your key.

## Run

Ask a question (from the `sdk/` folder):

```bash
node ask-ruth.mjs "Who is the record owner of Sanders Circle S Ranch in Haskell County, TX, and what are the vesting deed references?"
```

Or through npm (note the `--`):

```bash
npm run ask -- "What online records cover Haskell County before 1988?"
```

Save the answer to a file and keep the tool log on screen:

```bash
node ask-ruth.mjs "your question" > answer.md
```

## Check that Ruth loads (no API call, no key needed)

```bash
npm run check
```

Expected output ends with `Ruth loaded: ...` and `OK`. The check starts an SDK session without sending a prompt, asks the SDK which agents it loaded, and confirms `ruth` is among them.

## Notes

- A full title search can take many tool calls and several minutes, and it bills against your API key. The script stops after 40 turns (`maxTurns` in `ask-ruth.mjs`).
- Ruth's answers are research, not a title opinion or legal advice.
- Reports can contain names of private individuals. Handle saved answers accordingly.
