import { useState, type KeyboardEvent } from "react";

interface Props {
  placeholder: string;
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

// Message box: Enter sends, Shift+Enter adds a line.
export function Composer({ placeholder, busy, onSend, onStop }: Props) {
  const [text, setText] = useState("");
  const send = () => {
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };
  return (
    <div className="composer">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder}
        rows={3}
        maxLength={20000}
        aria-label="Your message"
      />
      {busy ? (
        <button className="btn" onClick={onStop}>
          Stop
        </button>
      ) : (
        <button className="btn primary" onClick={send} disabled={!text.trim()}>
          Send
        </button>
      )}
    </div>
  );
}
