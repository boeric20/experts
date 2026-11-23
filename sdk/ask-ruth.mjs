#!/usr/bin/env node
// Ask Ruth, the Texas title research agent, a question and print her answer.
//
// Ruth is defined in ../.claude/agents/ruth.md. Her knowledge folder is
// ../.claude/agents/ruth-knowledge/. The SDK loads the agent from the project's
// .claude/agents/ directory (settingSources: ["project"]) and runs the main
// conversation as Ruth (agent: "ruth"), so her system prompt, tool list, and
// model apply directly and her own words are printed.
//
// Usage:
//   node ask-ruth.mjs "your question"
//   node ask-ruth.mjs --check     # load Ruth and list agents; no API call

import { query } from "@anthropic-ai/claude-agent-sdk";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AGENT_NAME = "ruth";
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGENT_FILE = join(PROJECT_ROOT, ".claude", "agents", `${AGENT_NAME}.md`);
const KNOWLEDGE_DIR = join(PROJECT_ROOT, ".claude", "agents", "ruth-knowledge");
// Tools Ruth may use without a permission prompt. Matches the `tools` line in ruth.md.
const RUTH_TOOLS = ["Read", "Glob", "Grep", "WebSearch", "WebFetch"];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function checkFiles() {
  if (!existsSync(AGENT_FILE)) fail(`agent file not found: ${AGENT_FILE}`);
  if (!existsSync(KNOWLEDGE_DIR)) fail(`knowledge folder not found: ${KNOWLEDGE_DIR}`);
  return readdirSync(KNOWLEDGE_DIR).sort();
}

const baseOptions = {
  cwd: PROJECT_ROOT,
  settingSources: ["project"], // load .claude/agents/*.md from the project only
  agent: AGENT_NAME,           // run the main conversation as Ruth
  allowedTools: RUTH_TOOLS,
  maxTurns: 40,
};

// --check: start a session without sending a prompt, ask the SDK which agents it
// loaded, and confirm Ruth is among them. No model call is made.
async function check() {
  const knowledge = checkFiles();
  console.log(`Agent file:       ${AGENT_FILE}`);
  console.log(`Knowledge folder: ${KNOWLEDGE_DIR}`);
  console.log(`Knowledge files:  ${knowledge.join(", ")}`);

  let release;
  const idle = new Promise((r) => (release = r));
  async function* noPrompt() {
    await idle; // keep the input open without sending a message
  }

  const q = query({ prompt: noPrompt(), options: baseOptions });
  try {
    const agents = await q.supportedAgents();
    const ruth = agents.find((a) => a.name === AGENT_NAME);
    console.log(`Agents loaded:    ${agents.map((a) => a.name).join(", ")}`);
    if (!ruth) fail(`the SDK did not load an agent named "${AGENT_NAME}"`);
    console.log(`Ruth loaded:      ${ruth.description}`);
    console.log("OK");
  } finally {
    release();
    q.close();
  }
}

async function ask(question) {
  checkFiles();
  if (!process.env.ANTHROPIC_API_KEY) {
    fail("ANTHROPIC_API_KEY is not set. See sdk/README.md.");
  }

  let answer = null;
  for await (const message of query({ prompt: question, options: baseOptions })) {
    if (message.type === "assistant") {
      // Show tool activity on stderr so stdout holds only the answer.
      for (const block of message.message.content ?? []) {
        if (block.type === "tool_use") {
          const target = block.input?.file_path ?? block.input?.url ?? block.input?.query ?? block.input?.pattern ?? "";
          console.error(`[ruth] ${block.name} ${target}`.trimEnd());
        }
      }
    } else if (message.type === "result") {
      if (message.subtype === "success") {
        answer = message.result;
      } else {
        fail(`run ended with ${message.subtype}: ${(message.errors ?? []).join("; ")}`);
      }
    }
  }
  if (answer === null) fail("no answer returned");
  console.log(answer);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
  console.log('Usage: node ask-ruth.mjs "your question"\n       node ask-ruth.mjs --check');
  process.exit(args.length === 0 ? 1 : 0);
}

try {
  if (args[0] === "--check") await check();
  else await ask(args.join(" "));
} catch (err) {
  fail(err?.message ?? String(err));
}
