// Shared request handling for the Netlify Functions: access check, input limits, NDJSON streams.
import { createHash, timingSafeEqual } from "node:crypto";

export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
}

// Every function requires the site password so nobody else can spend the API key.
export function checkAccess(req: Request): Response | null {
  if (req.method !== "POST") return jsonError(405, "Use POST.");
  const expected = process.env.SITE_PASSWORD;
  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError(500, "The site is missing its ANTHROPIC_API_KEY environment variable. Add it in Netlify, then redeploy.");
  }
  if (!expected) {
    return jsonError(500, "The site is missing its SITE_PASSWORD environment variable. Add it in Netlify, then redeploy.");
  }
  const given = req.headers.get("x-site-password") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) return jsonError(401, "Wrong or missing site password.");
  return null;
}

export async function readJson(req: Request): Promise<unknown> {
  const text = await req.text();
  if (text.length > 400_000) throw new Error("Request is too large.");
  return JSON.parse(text);
}

export type StreamEvent =
  | { type: "status"; text: string }
  | { type: "text"; text: string }
  | { type: "sources"; items: { url: string; title: string }[] }
  | { type: "notice"; text: string }
  | { type: "error"; text: string }
  | { type: "done"; model: string; usage: { input: number; output: number; cacheRead: number } };

export type Emit = (event: StreamEvent) => void;

// Run `work` and stream its events to the browser as newline-delimited JSON.
export function ndjsonResponse(work: (emit: Emit) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit: Emit = (event) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        await work(emit);
      } catch (err) {
        emit({ type: "error", text: describeError(err) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}

export function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
