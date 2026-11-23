import type { StreamEvent } from "../lib/api";

// Notices, sources, and errors shown under an answer.
export interface ReplyMeta {
  status?: string;
  notices?: string[];
  sources?: { url: string; title: string }[];
  error?: string;
  model?: string;
}

export function ReplyMetaView({ meta, streaming }: { meta: ReplyMeta; streaming: boolean }) {
  return (
    <>
      {streaming && meta.status && <p className="status">{meta.status}…</p>}
      {meta.notices?.map((n, i) => (
        <p key={i} className="notice">
          {n}
        </p>
      ))}
      {meta.error && <p className="error">{meta.error}</p>}
      {meta.sources && meta.sources.length > 0 && (
        <details className="sources">
          <summary>Web sources ({meta.sources.length})</summary>
          <ul>
            {meta.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      {!streaming && meta.model && <p className="muted small">Answered by {meta.model}</p>}
    </>
  );
}


// Apply one streamed event to a reply's text and metadata.
export function applyEvent<T extends { content: string; meta: ReplyMeta }>(reply: T, e: StreamEvent): T {
  switch (e.type) {
    case "text":
      return { ...reply, content: reply.content + e.text };
    case "status":
      return { ...reply, meta: { ...reply.meta, status: e.text } };
    case "notice":
      return { ...reply, meta: { ...reply.meta, notices: [...(reply.meta.notices ?? []), e.text] } };
    case "sources":
      return { ...reply, meta: { ...reply.meta, sources: e.items } };
    case "error":
      return { ...reply, meta: { ...reply.meta, error: e.text } };
    case "done":
      return { ...reply, meta: { ...reply.meta, model: e.model, status: undefined } };
  }
}
