import React, { useState, useCallback, useMemo } from "react";
import { EnrichedContact, VerdictId, AutoSummary, Decision } from "./types";
import { VMAP } from "./verdicts";
import { useDecisions } from "./hooks/useDecisions";
import { useKeyboard } from "./hooks/useKeyboard";
import { computeLearning } from "./learning";
import { UploadScreen } from "./components/UploadScreen";
import { ContactCard } from "./components/ContactCard";
import { PatternPanel } from "./components/PatternPanel";
import { LearningScreen } from "./components/LearningScreen";
import { Phase2Gate } from "./components/Phase2Gate";
import { Phase2Swipe } from "./components/Phase2Swipe";
import { ICPSummary } from "./components/ICPSummary";
import "./App.css";

type AppPhase =
  | "upload1"         // CSV 1 upload screen
  | "swipe1"          // Phase 1 swiping
  | "phase1_results"  // Phase 1 done — showa learning before Phase 2
  | "phase2_gate"     // CSV 2 upload + auto-decision preview
  | "swipe2"          // Phase 2 — uncertain contacts only
  | "icp_summary";    // Phase 3 — full ICP view

export default function App() {
  const [phase, setPhase]         = useState<AppPhase>("upload1");
  const [contacts, setContacts]   = useState<EnrichedContact[]>([]);
  const [idx, setIdx]             = useState(0);
  const [animClass, setAnimClass] = useState("");
  const [isAnimating, setIsAnim]  = useState(false);
  const [flash, setFlash]         = useState<typeof VMAP[string] | null>(null);
  const [toast, setToast]         = useState({ msg: "", show: false });
  const [p2Summary, setP2Summary] = useState<AutoSummary | null>(null);
  const [p2Decisions, setP2Decisions] = useState<Decision[]>([]);

  const { decisions: p1Decisions, learning: p1Learning, addDecision, exportCSV, exportJSON, reset } = useDecisions();

  const isDone  = phase === "swipe1" && idx >= contacts.length;
  const current = phase === "swipe1" && !isDone ? contacts[idx] : null;

  const decide = useCallback((verdict: VerdictId, note = "") => {
    if (isAnimating || !current) return;
    const v = VMAP[verdict];
    addDecision(current, verdict, note);
    setFlash(v);
    setTimeout(() => setFlash(null), 500);
    setAnimClass(v.anim);
    setIsAnim(true);
    setTimeout(() => { setAnimClass(""); setIsAnim(false); setIdx(i => i + 1); }, 390);
  }, [isAnimating, current, addDecision]);

  useKeyboard(decide, phase === "swipe1" && !!current && !isAnimating);

  // When Phase 1 finishes
  React.useEffect(() => {
    if (phase === "swipe1" && idx > 0 && idx >= contacts.length) {
      setPhase("phase1_results");
    }
  }, [idx, contacts.length, phase]);

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  };

  function handleRestart() {
    setPhase("upload1"); setContacts([]); setIdx(0); reset();
    setP2Summary(null); setP2Decisions([]);
  }

  const progress = contacts.length ? Math.round((idx / contacts.length) * 100) : 0;

  // ── PHASE: upload CSV 1 ──
  if (phase === "upload1") return (
    <div className="app">
      <TopNav />
      <UploadScreen onLoad={c => { setContacts(c); setIdx(0); reset(); setPhase("swipe1"); }} />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );

  // ── PHASE: swipe CSV 1 ──
  if (phase === "swipe1" && !isDone) return (
    <div className="app">
      <TopNav
        label="Phase 1 — Swipe & Learn"
        idx={idx} total={contacts.length}
        showExport={p1Decisions.length > 0}
        onExport={() => { exportCSV(); showToast("CSV exported!"); }}
        onRestart={handleRestart}
      />
      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="progress-meta"><span>{progress}% complete</span><span>{contacts.length - idx} remaining</span></div>
      </div>
      {p1Decisions.length > 0 && <StatsRow decisions={p1Decisions} />}
      <div className="swipe-layout">
        <div style={{ position: "relative" }}>
          <div className="stack-wrap">
            {idx + 2 < contacts.length && <div className="ghost g2" />}
            {idx + 1 < contacts.length && <div className="ghost g1" />}
            <ContactCard contact={current!} onDecide={decide} animClass={animClass} isAnimating={isAnimating} />
            {flash && <div className={`vflash show ${flash.flCls}`}>{flash.emoji} {flash.label}</div>}
          </div>
        </div>
        <div className="side-col">
          <PatternPanel decisions={p1Decisions} />
          <KeyboardPanel />
          {p1Decisions.length > 0 && <HistoryPanel decisions={p1Decisions} />}
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );

  // ── PHASE: Phase 1 results ──
  if (phase === "phase1_results") return (
    <div className="app">
      <TopNav label="Phase 1 Complete" onRestart={handleRestart} />
      <LearningScreen
        decisions={p1Decisions}
        onRestart={handleRestart}
        onExportCSV={() => { exportCSV(); showToast("Exported!"); }}
        onExportJSON={() => { exportJSON(); showToast("Exported!"); }}
        onContinuePhase2={() => setPhase("phase2_gate")}
      />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );

  // ── PHASE: Phase 2 gate — upload CSV 2 ──
  if (phase === "phase2_gate" && p1Learning) return (
    <div className="app">
      <TopNav label="Phase 2 — Automate" onRestart={handleRestart} />
      <Phase2Gate
        learning={p1Learning}
        onReady={summary => { setP2Summary(summary); setPhase("swipe2"); }}
      />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );

  // ── PHASE: Phase 2 swipe (uncertain only) ──
  if (phase === "swipe2" && p2Summary && p1Learning) return (
    <Phase2Swipe
      summary={p2Summary}
      phase1Learning={p1Learning}
      onComplete={allP2 => { setP2Decisions(allP2); setPhase("icp_summary"); }}
    />
  );

  // ── PHASE: ICP Summary (Phase 3) ──
  if (phase === "icp_summary") return (
    <div className="app">
      <TopNav label="Phase 3 — ICP Summary" onRestart={handleRestart} />
      <ICPSummary
        phase1Decisions={p1Decisions}
        phase2Decisions={p2Decisions}
        onRestart={handleRestart}
      />
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );

  return null;
}

// ── Inline sub-components ────────────────────────────────────────────────────
function TopNav({ label, idx, total, showExport, onExport, onRestart }: any) {
  return (
    <nav className="topnav">
      <div className="brand">
        <div className="brand-dot">🎯</div>
        <div className="brand-name">ICP<span>Swipe</span>
          {label && <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 400, marginLeft: "8px" }}>{label}</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {idx != null && total != null && <div className="nav-pill">Contact <b>{idx + 1}</b> of <b>{total}</b></div>}
        {showExport && <button className="ebtn s" style={{ padding: "5px 12px", fontSize: ".75rem", borderRadius: "20px" }} onClick={onExport}>Export</button>}
        {onRestart  && <button className="restart-btn" style={{ padding: "5px 12px", fontSize: ".75rem", borderRadius: "20px" }} onClick={onRestart}>↩ Restart</button>}
      </div>
    </nav>
  );
}

function StatsRow({ decisions }: any) {
  const cnt = (v: string) => decisions.filter((d: any) => d.verdict === v).length;
  return (
    <div className="stats-row">
      {[["strong_yes","🎯","c-gy","Strong Yes"],["yes_exc","✅","c-ye","Exception"],
        ["pat_only","📐","c-po","Pattern"],["soft_no","🤔","c-sn","Soft No"],
        ["hard_no","❌","c-hn","Hard No"]].map(([v,e,c,l]) => (
        <div key={v} className="stat-chip">
          <span className={`stat-num ${c}`}>{cnt(v)}</span>
          <span className="stat-lbl">{e} {l}</span>
        </div>
      ))}
    </div>
  );
}

function KeyboardPanel() {
  const items = ["1 → Strong Yes","2 → Yes (Exc.)","3 → Pattern Only","4 → Soft No","5 → Hard No","S → Skip"];
  return (
    <div className="panel">
      <div className="ptitle">⌨️ Keyboard Shortcuts</div>
      <div className="kbd-grid">
        {items.map(s => <div key={s} className="kbd-row"><kbd>{s[0]}</kbd><span className="kd">{s.slice(4)}</span></div>)}
      </div>
    </div>
  );
}

function HistoryPanel({ decisions }: any) {
  const { VMAP } = require("./verdicts");
  return (
    <div className="panel">
      <div className="ptitle">📋 Recent Decisions</div>
      <div className="hist-list">
        {[...decisions].reverse().slice(0, 10).map((d: any, i: number) => {
          const v = VMAP[d.verdict];
          return (
            <div key={i} className={`hi ${v.hbCls}`}>
              <span className="hn">{d.c.fn} {d.c.ln}</span>
              <span className={`hb ${v.bbCls}`}>{v.emoji} {v.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return <div className={`toast ${show ? "show" : ""}`}>{msg}</div>;
}
