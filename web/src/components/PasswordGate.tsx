import { useState, type FormEvent } from "react";

// The site password keeps strangers from using your Claude API key. It is checked by the
// Netlify Functions against the SITE_PASSWORD environment variable; the browser only stores it.
export function PasswordGate({ onSubmit, message }: { onSubmit: (pw: string) => void; message?: string }) {
  const [pw, setPw] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pw) onSubmit(pw);
  };
  return (
    <main className="gate">
      <form onSubmit={submit} className="gate-card">
        <h1>Landman Experts</h1>
        <p>Enter the site password to talk to your experts.</p>
        {message && <p className="error">{message}</p>}
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Site password" autoFocus autoComplete="current-password" />
        <button className="btn primary" type="submit" disabled={!pw}>
          Continue
        </button>
      </form>
    </main>
  );
}
