import { useEffect, useRef, useState } from "react";
import { AccessError, streamEvents, teamPlan } from "../lib/api";
import { load, save } from "../lib/storage";
import { BY_NAME, ORCHESTRATOR } from "../lib/team";
import { Composer } from "./Composer";
import { Markdown } from "./Markdown";
import { ModelBadge } from "./ModelBadge";
import { ReplyMetaView, applyEvent, type ReplyMeta } from "./ReplyMeta";

interface Consultation {
  agent: string;
  part: string;
  why: string;
  content: string;
  meta: ReplyMeta;
  done: boolean;
}

interface TeamTurn {
  question: string;
  framing: string;
  stage: "planning" | "consulting" | "combining" | "done";
  experts: Consultation[];
  content: string; // the orchestrator's combined answer
  meta: ReplyMeta;
}

interface Props {
  password: string;
  webSearch: boolean;
  onAccessDenied: () => void;
}

const KEY = "experts.chat.__team__";

// "Ask the whole team": the orchestrator picks experts, each expert answers in its own call
// (shown live), then the orchestrator combines the answers. Three short calls keep each one
// inside Netlify's 60-second function limit.
export function TeamChat({ password, webSearch, onAccessDenied }: Props) {
  const [turns, setTurns] = useState<TeamTurn[]>(() => load<TeamTurn[]>(KEY, []));
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) save(KEY, turns.length ? turns : null);
  }, [turns, busy]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const updateLast = (fn: (t: TeamTurn) => TeamTurn) => setTurns((ts) => [...ts.slice(0, -1), fn(ts[ts.length - 1])]);
  const updateExpert = (i: number, fn: (c: Consultation) => Consultation) =>
    updateLast((t) => ({ ...t, experts: t.experts.map((c, j) => (j === i ? fn(c) : c)) }));

  async function ask(question: string) {
    const history = turns
      .filter((t) => t.stage === "done" && t.content.trim())
      .slice(-5)
      .map((t) => ({ question: t.question, answer: t.content }));
    setTurns((ts) => [
      ...ts,
      { question, framing: "", stage: "planning", experts: [], content: "", meta: { status: `${ORCHESTRATOR.firstName} is choosing the experts` } },
    ]);
    setBusy(true);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      // 1. The orchestrator chooses the experts.
      const plan = await teamPlan(question, history, password, abort.signal);
      const experts: Consultation[] = plan.experts.map((e) => ({ ...e, content: "", meta: { status: "Waiting" }, done: false }));
      updateLast((t) => ({ ...t, framing: plan.framing, experts, stage: "consulting", meta: { status: experts.length ? "The experts are working" : "No experts needed" } }));

      // 2. Each expert answers in parallel.
      const answers = await Promise.all(
        experts.map(async (e, i) => {
          let text = "";
          try {
            await streamEvents(
              "/api/chat",
              { mode: "consult", agent: e.agent, question, part: e.part, framing: plan.framing, webSearch },
              password,
              (ev) => {
                if (ev.type === "text") text += ev.text;
                updateExpert(i, (c) => applyEvent(c, ev));
              },
              abort.signal,
            );
          } catch (err) {
            if (err instanceof AccessError) {
              abort.abort();
              throw err;
            }
            updateExpert(i, (c) => ({ ...c, meta: { ...c.meta, status: undefined, error: abort.signal.aborted ? "Stopped." : (err as Error).message } }));
          }
          updateExpert(i, (c) => ({ ...c, done: true }));
          return { agent: e.agent, part: e.part, answer: text };
        }),
      );
      if (abort.signal.aborted) throw new Error("Stopped.");

      // 3. The orchestrator combines the answers.
      updateLast((t) => ({ ...t, stage: "combining", meta: { status: `${ORCHESTRATOR.firstName} is combining the answers` } }));
      await streamEvents(
        "/api/team-answer",
        { question, framing: plan.framing, consultations: answers, history },
        password,
        (ev) => updateLast((t) => applyEvent(t, ev)),
        abort.signal,
      );
    } catch (err) {
      if (err instanceof AccessError) onAccessDenied();
      updateLast((t) => ({ ...t, meta: { ...t.meta, status: undefined, error: abort.signal.aborted ? "Stopped." : (err as Error).message } }));
    } finally {
      updateLast((t) => ({ ...t, stage: "done", experts: t.experts.map((c) => ({ ...c, done: true })) }));
      setBusy(false);
      abortRef.current = null;
    }
  }

  function clear() {
    if (busy) return;
    if (turns.length && !window.confirm("Start a new team conversation? This one will be cleared from this browser.")) return;
    setTurns([]);
  }

  return (
    <section className="chat" aria-label="Ask the whole team">
      <header className="chat-head">
        <div>
          <h1>
            Ask the whole team <ModelBadge model={ORCHESTRATOR.model} />
          </h1>
          <p className="persona">
            {ORCHESTRATOR.firstName}, the orchestrator, reads your question, brings in the one to four experts it needs, lets
            them work in parallel, and combines their answers into one. <strong>Voice:</strong> {ORCHESTRATOR.voice}
          </p>
          <p className="muted small">Each team question makes several Claude calls, so it costs more than asking one expert.</p>
        </div>
        <button className="btn" onClick={clear} disabled={busy || turns.length === 0}>
          New conversation
        </button>
      </header>

      <div className="messages">
        {turns.length === 0 && (
          <p className="empty">
            Ask a question that crosses several areas, for example: "What would it take to show transmission lines near the
            Stamford project, and how current would that data be?"
          </p>
        )}
        {turns.map((t, i) => {
          const live = busy && i === turns.length - 1;
          return (
            <div key={i} className="team-turn">
              <article className="msg msg-user">
                <div className="who">You</div>
                <p className="user-text">{t.question}</p>
              </article>

              {t.framing && <p className="framing">{t.framing}</p>}
              {t.experts.length > 0 && (
                <div className="consults">
                  {t.experts.map((c) => {
                    const a = BY_NAME.get(c.agent);
                    return (
                      <details key={c.agent} className="consult" open={live && !c.done}>
                        <summary>
                          <span className="agent-name">{a?.firstName ?? c.agent}</span> <span className="muted">{a?.role}</span>{" "}
                          {a && <ModelBadge model={a.model} />}
                          <span className="consult-state">{c.done ? (c.meta.error ? "failed" : "answered") : c.meta.status ?? "working"}</span>
                        </summary>
                        <p className="muted small">Asked: {c.part}</p>
                        <p className="muted small">Why: {c.why}</p>
                        <Markdown text={c.content} />
                        <ReplyMetaView meta={c.meta} streaming={live && !c.done} />
                      </details>
                    );
                  })}
                </div>
              )}

              <article className="msg msg-assistant">
                <div className="who">{ORCHESTRATOR.firstName}, combined answer</div>
                <Markdown text={t.content} />
                <ReplyMetaView meta={t.meta} streaming={live} />
              </article>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <Composer placeholder="Ask the whole team" busy={busy} onSend={ask} onStop={() => abortRef.current?.abort()} />
    </section>
  );
}
