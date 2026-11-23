// Build step: read the expert team from this repository and write two generated files.
//
//   src/generated/agents.json          what the browser shows (names, roles, models, personalities)
//   server/generated/agent-prompts.json what the Netlify Functions send to Claude (full prompts and
//                                       knowledge documents). Never shipped to the browser.
//
// Sources, relative to the repository root:
//   .claude/agents/<name>.md                 agent definition (frontmatter + system prompt)
//   .claude/skills/<skill>/SKILL.md          skills an agent preloads (its `skills:` list)
//   .claude/agent-memory/<name>/MEMORY.md    the agent's saved lessons, if any
//   knowledge/<name>/                        the agent's knowledge folder
//   docs/expert-roster.md                    which group each agent belongs to
//   web/team-context.md                      rules shared by every agent in the web chat
//
// Agents listed in web/site.config.json "exclude" are skipped.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, "..");
const ROOT = join(WEB, "..");
const config = JSON.parse(readFileSync(join(WEB, "site.config.json"), "utf8"));

const TEXT_EXT = new Set([".md", ".txt", ".csv", ".json"]);
const MODELS = new Set(["opus", "sonnet", "haiku"]);
const MAX_PDF_BYTES = 20 * 1024 * 1024; // keep well under the API's 32 MB request limit

function fail(msg) {
  console.error(`build-agents: ${msg}`);
  process.exit(1);
}

function splitFrontmatter(text, file) {
  if (!text.startsWith("---\n")) fail(`${file} has no frontmatter`);
  const end = text.indexOf("\n---", 4);
  if (end < 0) fail(`${file} frontmatter is not closed`);
  const meta = parseYaml(text.slice(4, end));
  const body = text.slice(text.indexOf("\n", end + 1) + 1).trim();
  return { meta, body };
}

// Group headings from docs/expert-roster.md ("## Land, title, and records" ... rows with `agent-name`).
function readGroups() {
  const file = join(ROOT, "docs", "expert-roster.md");
  const groups = new Map();
  if (!existsSync(file)) return groups;
  let current = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) {
      current = h[1].trim() === "Coordinating agents" ? "Coordination" : h[1].trim();
      continue;
    }
    const row = line.match(/^\| `([a-z0-9-]+)` \|/);
    if (row && current && current !== "Skills") groups.set(row[1], current);
  }
  return groups;
}

function persona(body, name) {
  const firstName = body.match(/Your name is ([A-Z][a-zA-Z'-]+)\./)?.[1];
  const voice = body.match(/Voice: (.+?) Working style:/)?.[1]?.trim();
  const style = body.match(/Working style: (.+?)\n/)?.[1]?.trim();
  const role = body.match(/^You are the (.+?) (?:on|of|for) /m)?.[1]?.trim();
  if (!firstName || !voice || !style || !role) fail(`${name}: could not read name, voice, working style, or role`);
  return { firstName, voice, style, role };
}

function skillText(skill, agent) {
  const file = join(ROOT, ".claude", "skills", skill, "SKILL.md");
  if (!existsSync(file)) fail(`${agent} preloads skill "${skill}" but ${file} is missing`);
  const { body } = splitFrontmatter(readFileSync(file, "utf8"), file);
  return `### Skill: ${skill}\n\n${body}`;
}

function knowledge(agent) {
  const dir = join(ROOT, "knowledge", agent);
  const texts = [];
  const pdfs = [];
  const skipped = [];
  if (!existsSync(dir)) return { texts, pdfs, skipped, files: [] };
  const files = readdirSync(dir).filter((f) => !f.startsWith(".")).sort();
  for (const f of files) {
    const path = join(dir, f);
    if (!statSync(path).isFile()) continue;
    // The folder README describes what belongs in the folder; it is not knowledge itself.
    if (f.toLowerCase() === "readme.md") continue;
    const ext = extname(f).toLowerCase();
    if (TEXT_EXT.has(ext)) {
      texts.push(`### Knowledge file: knowledge/${agent}/${f}\n\n${readFileSync(path, "utf8").trim()}`);
    } else if (ext === ".pdf") {
      const data = readFileSync(path);
      if (data.length > MAX_PDF_BYTES) {
        skipped.push(`${f} (larger than 20 MB)`);
        continue;
      }
      pdfs.push({ title: `knowledge/${agent}/${f}`, data: data.toString("base64") });
    } else {
      skipped.push(`${f} (file type not supported: use .md, .txt, .csv, .json, or .pdf)`);
    }
  }
  return { texts, pdfs, skipped, files };
}

const teamContext = readFileSync(join(WEB, "team-context.md"), "utf8").trim();
const groups = readGroups();
const agentsDir = join(ROOT, ".claude", "agents");
const exclude = new Set(config.exclude ?? []);

const publicAgents = [];
const prompts = {};
const warnings = [];

for (const file of readdirSync(agentsDir).filter((f) => f.endsWith(".md")).sort()) {
  const name = basename(file, ".md");
  if (exclude.has(name)) continue;
  const { meta, body } = splitFrontmatter(readFileSync(join(agentsDir, file), "utf8"), file);
  if (meta.name !== name) fail(`${file}: frontmatter name "${meta.name}" does not match the file name`);
  if (!MODELS.has(meta.model)) fail(`${file}: model must be opus, sonnet, or haiku (found "${meta.model}")`);
  const p = persona(body, name);

  const parts = [`# Your instructions (from .claude/agents/${name}.md)\n\n${body}`];
  const skills = Array.isArray(meta.skills) ? meta.skills : [];
  if (skills.length) parts.push(`# Your preloaded skills\n\n${skills.map((s) => skillText(s, name)).join("\n\n")}`);
  const memoryFile = join(ROOT, ".claude", "agent-memory", name, "MEMORY.md");
  if (existsSync(memoryFile)) parts.push(`# Your agent memory (.claude/agent-memory/${name}/MEMORY.md)\n\n${readFileSync(memoryFile, "utf8").trim()}`);
  const k = knowledge(name);
  if (k.texts.length) parts.push(`# Your knowledge folder: text documents\n\n${k.texts.join("\n\n")}`);
  const listed = k.files.filter((f) => f.toLowerCase() !== "readme.md");
  parts.push(
    `# Your knowledge folder (knowledge/${name}/)\n\n` +
      (listed.length
        ? `Files: ${listed.join(", ")}. Text files are included above; PDF files are attached to the first message of the conversation.`
        : "The folder holds only its README. Say nothing about it and carry on.")
  );
  for (const s of k.skipped) warnings.push(`${name}: skipped knowledge file ${s}`);

  prompts[name] = { model: meta.model, system: parts.join("\n\n"), pdfs: k.pdfs };
  publicAgents.push({
    name,
    firstName: p.firstName,
    role: p.role,
    model: meta.model,
    voice: p.voice,
    workingStyle: p.style,
    description: String(meta.description ?? ""),
    group: groups.get(name) ?? "Other",
    knowledgeFiles: listed,
  });
}

if (!prompts[config.orchestrator]) fail(`orchestrator agent "${config.orchestrator}" not found`);
if (publicAgents.length < 2) fail("fewer than two agents found");

mkdirSync(join(WEB, "src", "generated"), { recursive: true });
mkdirSync(join(WEB, "server", "generated"), { recursive: true });
writeFileSync(
  join(WEB, "src", "generated", "agents.json"),
  JSON.stringify({ orchestrator: config.orchestrator, groupOrder: config.groupOrder ?? [], agents: publicAgents }, null, 2)
);
writeFileSync(join(WEB, "server", "generated", "agent-prompts.json"), JSON.stringify({ teamContext, agents: prompts }));

const pdfCount = Object.values(prompts).reduce((n, a) => n + a.pdfs.length, 0);
console.log(`build-agents: ${publicAgents.length} agents, ${pdfCount} PDF knowledge files, orchestrator "${config.orchestrator}"`);
for (const w of warnings) console.warn(`build-agents: warning: ${w}`);
