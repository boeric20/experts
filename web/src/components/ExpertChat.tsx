import { useEffect, useRef, useState } from "react";
import { AccessError, streamEvents } from "../lib/api";
import { load, save } from "../lib/storage";
import type { Agent } from "../lib/team";
import { Composer } from "./Composer";
import { Markdown } from "./Markdown";
import { ModelBadge } from "./ModelBadge";
import { ReplyMetaView, applyEvent, type ReplyMeta } from "./ReplyMeta";

interface Message {
  role: "user" | "assistant";
  content: string;
  meta: ReplyMeta;
}

interface Props {
  agent: Agent;
  password: string;
  webSearch: boolean;
  onAccessDenied: () => void;
}

export function ExpertChat({ agent, password, webSearch, onAccessDenied }: Props) {
  const key = `experts.chat.${agent.name}`;
  const [messages, setMessages] = useState<Message[]>(() => load<Message[]>(key, []));
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) save(key, messages.length ? messages : null);
  }, [key, messages, busy]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const history = [...messages, { role: "user" as const, content: text, meta: {} }];
    setMessages([...history, { role: "assistant", content: "", meta: { status: "Sending" } }]);
    setBusy(true);
    const abort = new AbortController();
    abortRef.current = abort;
    // Send only real turns: skip replies that failed before any text arrived.
    const turns = history.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content }));
    const update = (fn: (m: Message) => Message) =>
      setMessages((ms) => [...ms.slice(0, -1), fn(ms[ms.length - 1])]);
    try {
      await streamEvents(
        "/api/chat",
        { mode: "chat", agent: agent.name, messages: turns, webSearch },
        password,
        (e) => update((m) => applyEvent(m, e)),
        abort.signal,
      );
    } catch (err) {
      if (err instanceof AccessError) onAccessDenied();
      const stopped = abort.signal.aborted;
      update((m) => ({ ...m, meta: { ...m.meta, status: undefined, error: stopped ? "Stopped." : (err as Error).message } }));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function clear() {
    if (busy) return;
    if (messages.length && !window.confirm(`Start a new conversation with ${agent.firstName}? This one will be cleared from this browser.`)) return;
    setMessages([]);
  }

  return (
    <section className="chat" aria-label={`Conversation with ${agent.firstName}`}>
      <header className="chat-head">
        <div>
          <h1>
            {agent.firstName} <span className="muted">{agent.role}</span> <ModelBadge model={agent.model} />
          </h1>
          <p className="persona">
            <strong>Voice:</strong> {agent.voice} <strong>Working style:</strong> {agent.workingStyle}
          </p>
          <p className="muted small">{agent.description}</p>
          {agent.knowledgeFiles.length > 0 && (
            <p className="muted small">Knowledge folder: {agent.knowledgeFiles.join(", ")}</p>
          )}
        </div>
        <button className="btn" onClick={clear} disabled={busy || messages.length === 0}>
          New conversation
        </button>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">
            Ask {agent.firstName} anything in their area. For a question that crosses several areas, use Ask the whole team.
          </p>
        )}
        {messages.map((m, i) => (
          <article key={i} className={`msg msg-${m.role}`}>
            <div className="who">{m.role === "user" ? "You" : agent.firstName}</div>
            {m.role === "user" ? <p className="user-text">{m.content}</p> : <Markdown text={m.content} />}
            {m.role === "assistant" && <ReplyMetaView meta={m.meta} streaming={busy && i === messages.length - 1} />}
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <Composer placeholder={`Message ${agent.firstName}`} busy={busy} onSend={send} onStop={() => abortRef.current?.abort()} />
    </section>
  );
}
