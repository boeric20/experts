import { useState } from "react";
import { ExpertChat } from "./components/ExpertChat";
import { PasswordGate } from "./components/PasswordGate";
import { Sidebar, TEAM_KEY } from "./components/Sidebar";
import { TeamChat } from "./components/TeamChat";
import { load, save } from "./lib/storage";
import { BY_NAME, EXPERTS } from "./lib/team";

export function App() {
  const [password, setPassword] = useState<string>(() => load("experts.password", ""));
  const [gateMessage, setGateMessage] = useState<string | undefined>();
  const [selected, setSelected] = useState<string>(() => {
    const s = load("experts.selected", TEAM_KEY);
    return s === TEAM_KEY || BY_NAME.has(s) ? s : TEAM_KEY;
  });
  const [webSearch, setWebSearch] = useState<boolean>(() => load("experts.webSearch", true));
  const [menuOpen, setMenuOpen] = useState(false);

  if (!password) {
    return (
      <PasswordGate
        message={gateMessage}
        onSubmit={(pw) => {
          setPassword(pw);
          save("experts.password", pw);
          setGateMessage(undefined);
        }}
      />
    );
  }

  const onAccessDenied = () => {
    setPassword("");
    save("experts.password", null);
    setGateMessage("That password was not accepted. Enter the site password again.");
  };
  const signOut = () => {
    setPassword("");
    save("experts.password", null);
    setGateMessage(undefined);
  };
  const select = (key: string) => {
    setSelected(key);
    save("experts.selected", key);
    setMenuOpen(false);
  };
  const agent = BY_NAME.get(selected);

  return (
    <div className={`layout ${menuOpen ? "menu-open" : ""}`}>
      <div className="topbar">
        <button className="btn menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="sidebar">
          {menuOpen ? "Close" : "Experts"}
        </button>
        <span className="brand">Landman Experts</span>
        <span className="muted small">{EXPERTS.length} experts</span>
        <label className="toggle" title="Let experts search the web to check current facts. Adds time and cost.">
          <input
            type="checkbox"
            checked={webSearch}
            onChange={(e) => {
              setWebSearch(e.target.checked);
              save("experts.webSearch", e.target.checked);
            }}
          />
          Web search
        </label>
        <button className="btn link" onClick={signOut} title="Forget the site password on this browser">
          Sign out
        </button>
      </div>
      <div id="sidebar" className="sidebar-wrap">
        <Sidebar selected={selected} onSelect={select} />
      </div>
      <main className="main">
        {selected === TEAM_KEY || !agent ? (
          <TeamChat password={password} webSearch={webSearch} onAccessDenied={onAccessDenied} />
        ) : (
          <ExpertChat key={agent.name} agent={agent} password={password} webSearch={webSearch} onAccessDenied={onAccessDenied} />
        )}
      </main>
    </div>
  );
}
