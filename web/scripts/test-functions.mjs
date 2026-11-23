// End-to-end test of the Netlify Functions without calling the real Claude API.
//
// 1. Bundles each function with esbuild, the way Netlify does.
// 2. Starts a local stand-in for the Claude API that records each request and replies with
//    canned answers (streamed for chat, JSON for the team plan).
// 3. Calls every function and checks the responses and what was sent to "Claude".
//
// Run with: npm test   (after npm run agents, which npm run build does)
import { build } from "esbuild";
import { createServer } from "node:http";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "experts-fn-"));
const fnDir = join(WEB, "netlify", "functions");
const names = readdirSync(fnDir).filter((f) => f.endsWith(".mts")).map((f) => f.replace(/\.mts$/, ""));

for (const name of names) {
  await build({
    entryPoints: [join(fnDir, `${name}.mts`)],
    outfile: join(out, `${name}.mjs`),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    logLevel: "error",
  });
}
console.log(`bundled ${names.length} functions: ${names.join(", ")}`);

// ---- stand-in Claude API
const requests = [];
const PLAN = {
  framing: "The owner wants to know what pipeline data near a project would show.",
  experts: [
    { agent: "pipeline-rrc-analyst", part: "What RRC pipeline data exists?", why: "Pipelines" },
    { agent: "texas-title-examiner", part: "Any title angle?", why: "Easements" },
    { agent: "pipeline-rrc-analyst", part: "duplicate", why: "dup" },
    { agent: "not-a-real-expert", part: "x", why: "invented" },
    { agent: "orchestrator", part: "x", why: "self" },
  ],
};
function sse(res, model, text) {
  res.writeHead(200, { "content-type": "text/event-stream" });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send("message_start", {
    type: "message_start",
    message: { id: "msg_test", type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 0, cache_read_input_tokens: 40, cache_creation_input_tokens: 0 } },
  });
  send("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
  for (const part of text.match(/.{1,12}/gs)) {
    send("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: part } });
  }
  send("content_block_stop", { type: "content_block_stop", index: 0 });
  send("message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 20 } });
  send("message_stop", { type: "message_stop" });
  res.end();
}
const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const json = JSON.parse(body);
    requests.push({ url: req.url, headers: req.headers, body: json });
    if (json.stream) return sse(res, json.model, `Mock answer from ${json.model}. Ruth, test.`);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      id: "msg_plan", type: "message", role: "assistant", model: json.model, stop_reason: "end_turn", stop_sequence: null,
      content: [{ type: "text", text: JSON.stringify(PLAN) }],
      usage: { input_tokens: 50, output_tokens: 30 },
    }));
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.SITE_PASSWORD = "correct horse";

const fn = {};
for (const name of names) fn[name] = (await import(pathToFileURL(join(out, `${name}.mjs`)).href)).default;

const call = (name, body, password = "correct horse") =>
  fn[name](new Request(`http://site/api/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-site-password": password },
    body: JSON.stringify(body),
  }));
const events = async (res) => (await res.text()).trim().split("\n").map((l) => JSON.parse(l));
let passed = 0;
const check = async (label, fnc) => {
  await fnc();
  passed++;
  console.log(`ok  ${label}`);
};

await check("wrong password is refused with 401 and nothing is sent to Claude", async () => {
  const res = await call("chat", { mode: "chat", agent: "gis-engineer", messages: [{ role: "user", content: "hi" }] }, "nope");
  assert.equal(res.status, 401);
  assert.equal(requests.length, 0);
});

await check("GET is refused", async () => {
  const res = await fn.chat(new Request("http://site/api/chat"));
  assert.equal(res.status, 405);
});

await check("unknown expert and malformed bodies are refused", async () => {
  assert.equal((await call("chat", { mode: "chat", agent: "nobody", messages: [{ role: "user", content: "hi" }] })).status, 400);
  assert.equal((await call("chat", { mode: "chat", agent: "orchestrator", messages: [{ role: "user", content: "hi" }] })).status, 400);
  assert.equal((await call("chat", { mode: "chat", agent: "gis-engineer", messages: [] })).status, 400);
  assert.equal((await call("chat", { mode: "chat", agent: "gis-engineer", messages: [{ role: "assistant", content: "x" }] })).status, 400);
  assert.equal(requests.length, 0);
});

await check("chat with a Sonnet expert streams text, uses the agent's model, caches its prompt, sends web search and fallbacks", async () => {
  const res = await call("chat", { mode: "chat", agent: "gis-engineer", messages: [{ role: "user", content: "Why is the map slow?" }], webSearch: true });
  assert.equal(res.headers.get("content-type"), "application/x-ndjson; charset=utf-8");
  const ev = await events(res);
  assert.equal(ev.filter((e) => e.type === "text").map((e) => e.text).join(""), "Mock answer from claude-sonnet-5-5. Ruth, test.");
  const done = ev.find((e) => e.type === "done");
  assert.equal(done.model, "claude-sonnet-5-5");
  assert.equal(done.usage.cacheRead, 40);
  const r = requests.at(-1).body;
  assert.equal(r.model, "claude-sonnet-5-5");
  assert.equal(r.output_config.effort, "medium");
  assert.equal(r.system.length, 2);
  assert.match(r.system[0].text, /Landman Experts web\s+chat/);
  assert.match(r.system[1].text, /Your name is Maya/);
  assert.deepEqual(r.system[1].cache_control, { type: "ephemeral" });
  assert.equal(r.tools[0].type, "web_search_20260209");
  assert.equal(r.fallbacks, "default");
  assert.match(requests.at(-1).headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
  const h = requests.at(-1).headers;
  assert.ok(h["x-api-key"] === "test-key" || h.authorization === "Bearer test-key", "API key sent from ANTHROPIC_API_KEY");
});

await check("chat with Ruth (Opus) attaches her PDF guide to the first message, cached", async () => {
  const res = await call("chat", {
    mode: "chat",
    agent: "texas-title-examiner",
    messages: [
      { role: "user", content: "What do you need first?" },
      { role: "assistant", content: "A county." },
      { role: "user", content: "Pecos." },
    ],
  });
  await events(res);
  const r = requests.at(-1).body;
  assert.equal(r.model, "claude-opus-5-5");
  const first = r.messages[0].content;
  assert.equal(first[0].type, "document");
  assert.equal(first[0].source.media_type, "application/pdf");
  assert.match(first[0].title, /texas-title-examiner-agent-guide\.pdf/);
  assert.deepEqual(first[0].cache_control, { type: "ephemeral" });
  assert.equal(first.at(-1).text, "What do you need first?");
  assert.equal(r.messages[2].content, "Pecos.");
  assert.equal(r.tools, undefined);
  assert.match(r.system[1].text, /Your agent memory/);
  assert.match(r.system[1].text, /Skill: texas-land-title-basics/);
});

await check("Haiku expert uses Haiku, low effort, basic web search, and no fallback beta", async () => {
  await events(await call("chat", { mode: "chat", agent: "appraisal-district-analyst", messages: [{ role: "user", content: "PROP_ID?" }], webSearch: true }));
  const { body: r, headers } = requests.at(-1);
  assert.equal(r.model, "claude-haiku-5-5");
  assert.equal(r.output_config.effort, "low");
  assert.equal(r.tools[0].type, "web_search_20250305");
  assert.equal(r.fallbacks, undefined);
  assert.ok(!String(headers["anthropic-beta"] ?? "").includes("server-side-fallback"));
});

await check("consult mode wraps the orchestrator's question in a consultation brief", async () => {
  await events(await call("chat", { mode: "consult", agent: "pipeline-rrc-analyst", question: "Pipelines near Stamford?", part: "What RRC data exists?", framing: "Pipeline layer" }));
  const r = requests.at(-1).body;
  assert.equal(r.max_tokens, 4000);
  assert.match(r.messages[0].content, /orchestrator, Morgan, is consulting you/);
  assert.match(r.messages[0].content, /Your part:\nWhat RRC data exists\?/);
});

await check("team plan returns the orchestrator's experts, de-duplicated, unknown names dropped, structured output on Opus", async () => {
  const res = await call("team-plan", { question: "Pipelines near Stamford?", history: [] });
  assert.equal(res.status, 200);
  const plan = await res.json();
  assert.equal(plan.experts.length, 2);
  assert.deepEqual(plan.experts.map((e) => e.agent), ["pipeline-rrc-analyst", "texas-title-examiner"]);
  const r = requests.at(-1).body;
  assert.equal(r.model, "claude-opus-5-5");
  assert.equal(r.output_config.format.type, "json_schema");
  assert.ok(r.output_config.format.schema.properties.experts);
  assert.match(r.system[2].text, /- gis-engineer \(Maya/);
  assert.doesNotMatch(r.system[2].text, /- orchestrator \(/);
  assert.match(r.system[2].text, /choose the experts/);
});

await check("team answer streams Morgan's combined answer built from the experts' answers", async () => {
  const ev = await events(await call("team-answer", {
    question: "Pipelines near Stamford?",
    framing: "Pipeline layer",
    consultations: [{ agent: "pipeline-rrc-analyst", part: "What RRC data exists?", answer: "RRC county shapefiles, NAD27." }],
  }));
  assert.ok(ev.some((e) => e.type === "done"));
  const r = requests.at(-1).body;
  assert.equal(r.model, "claude-opus-5-5");
  assert.match(r.messages[0].content, /Hank \(pipeline-rrc-analyst/);
  assert.match(r.messages[0].content, /RRC county shapefiles, NAD27\./);
  assert.match(r.system[2].text, /combine the experts' answers/);
  assert.equal(r.tools, undefined);
});

await check("a missing SITE_PASSWORD makes every function refuse instead of running open", async () => {
  delete process.env.SITE_PASSWORD;
  const before = requests.length;
  const res = await call("team-plan", { question: "x" });
  assert.equal(res.status, 500);
  assert.match((await res.json()).error, /SITE_PASSWORD/);
  assert.equal(requests.length, before);
});

server.close();
console.log(`\nALL ${passed} CHECKS PASSED`);
