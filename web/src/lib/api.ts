// Calls to this site's Netlify Functions. The browser never talks to the Claude API directly.

export type StreamEvent =
  | { type: "status"; text: string }
  | { type: "text"; text: string }
  | { type: "sources"; items: { url: string; title: string }[] }
  | { type: "notice"; text: string }
  | { type: "error"; text: string }
  | { type: "done"; model: string; usage: { input: number; output: number; cacheRead: number } };

export class AccessError extends Error {}

async function post(path: string, body: unknown, password: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-site-password": password },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 401) throw new AccessError("Wrong or missing site password.");
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const data = await res.json();
      if (typeof data?.error === "string") message = data.error;
    } catch {
      /* keep the status message */
    }
    throw new Error(message);
  }
  return res;
}

// POST and read newline-delimited JSON events as they arrive.
export async function streamEvents(
  path: string,
  body: unknown,
  password: string,
  onEvent: (e: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await post(path, body, password, signal);
  if (!res.body) throw new Error("The server sent no response.");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line) onEvent(JSON.parse(line) as StreamEvent);
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as StreamEvent);
}

export interface TeamPlan {
  framing: string;
  experts: { agent: string; part: string; why: string }[];
}

export async function teamPlan(question: string, history: { question: string; answer: string }[], password: string, signal?: AbortSignal): Promise<TeamPlan> {
  const res = await post("/api/team-plan", { question, history }, password, signal);
  return (await res.json()) as TeamPlan;
}
