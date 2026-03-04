import React, { useState, useCallback } from "react";
import { AutoSummary, Decision, VerdictId, LearningOutput } from "../types";
import { VMAP, VERDICTS } from "../verdicts";
import { ContactCard } from "./ContactCard";
import { useKeyboard } from "../hooks/useKeyboard";

interface Props {
  summary: AutoSummary;
  phase1Learning: LearningOutput;
  onComplete: (allDecisions: Decision[]) => void;
}

export const Phase2Swipe: React.FC<Props> = ({ summary, phase1Learning, onComplete }) => {
  const queue = summary.uncertain;
  const [idx, setIdx]             = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [animClass, setAnimClass] = useState("");
  const [isAnimating, setIsAnim]  = useState(false);
  const [flash, setFlash]         = useState<typeof VMAP[string] | null>(null);

  const isDone  = idx >= queue.length;
  const current = !isDone ? queue[idx] : null;

  const decide = useCallback((verdict: VerdictId, note = "") => {
    if (isAnimating || !current) return;
    const v = VMAP[verdict];
    setDecisions(prev => [...prev, {
      ts: new Date().toISOString(), c: current, verdict, note,
      pFit: v.pFit, persF: v.persF, source: "manual" as const,
    }]);
    setFlash(v);
    setTimeout(() => setFlash(null), 500);
    setAnimClass(v.anim);
    setIsAnim(true);
    setTimeout(() => { setAnimClass(""); setIsAnim(false); setIdx(i => i+1); }, 390);
  }, [isAnimating, current]);

  useKeyboard(decide, !!current && !isAnimating);

  function handleDone() {
    const autoApprove: Decision[] = summary.approved.map(c => ({
      ts: new Date().toISOString(), c, verdict: "strong_yes" as VerdictId,
      note: "Auto-approved", pFit: 1 as const, persF: 1 as const,
      source: "auto_approve" as const, autoScore: c.autoScore,
    }));
    const autoReject: Decision[] = summary.rejected.map(c => ({
      ts: new Date().toISOString(), c, verdict: "hard_no" as VerdictId,
      note: "Auto-rejected", pFit: 0 as const, persF: 0 as const,
      source: "auto_reject" as const, autoScore: c.autoScore,
    }));
    onComplete([...autoApprove, ...autoReject, ...decisions]);
  }

  if (isDone) return (
    <div className="app">
      <nav className="topnav">
        <div className="brand"><div className="brand-dot">🎯</div><div className="brand-name">ICP<span>Swipe</span></div></div>
      </nav>
      <div style={{textAlign:"center",padding:"60px 0 24px"}}>
        <div style={{fontSize:"2.5rem",marginBottom:"12px"}}>🎉</div>
        <h2 style={{fontSize:"1.5rem",fontWeight:800,marginBottom:"8px"}}>Manual review complete</h2>
        <p style={{color:"var(--muted)",marginBottom:"28px"}}>Reviewed {decisions.length} uncertain contacts.</p>
        <button className="ebtn p" onClick={handleDone}>View Full ICP Summary →</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <nav className="topnav">
        <div className="brand"><div className="brand-dot">🎯</div>
          <div className="brand-name">ICP<span>Swipe</span>
            <span style={{fontSize:".72rem",color:"var(--muted)",fontWeight:400,marginLeft:"8px"}}>Phase 2</span>
          </div>
        </div>
        <div className="nav-pill">
          Uncertain <b>{idx+1}</b> of <b>{queue.length}</b>
          &nbsp;·&nbsp; ✅ {summary.approved.length} approved
          &nbsp;·&nbsp; ❌ {summary.rejected.length} rejected
        </div>
      </nav>
      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{width:`${Math.round((idx/queue.length)*100)}%`}} /></div>
        <div className="progress-meta"><span>Uncertain queue</span><span>{queue.length-idx} remaining</span></div>
      </div>
      {current && (
        <div className="uncertain-banner">
          <span className="ub-label">System confidence:</span>
          <span className="ub-score">{current.autoScore}/100</span>
          <span className="ub-sub">— too close to auto-decide</span>
        </div>
      )}
      <div className="swipe-layout">
        <div style={{position:"relative"}}>
          <div className="stack-wrap">
            {idx+2 < queue.length && <div className="ghost g2" />}
            {idx+1 < queue.length && <div className="ghost g1" />}
            <ContactCard contact={current!} onDecide={decide} animClass={animClass} isAnimating={isAnimating} />
            {flash && <div className={`vflash show ${flash.flCls}`}>{flash.emoji} {flash.label}</div>}
          </div>
        </div>
        <div className="side-col">
          <div className="panel">
            <div className="ptitle">📊 Phase 1 Pattern Context</div>
            {Object.values(phase1Learning.profile).map(dim => {
              if (!dim.best) return null;
              const col = dim.best.pct > 60 ? "#22c55e" : dim.best.pct > 35 ? "#f59e0b" : "#ef4444";
              return (
                <div key={dim.label} className="pat-row">
                  <span className="pat-lbl">{dim.label}</span>
                  <span style={{fontSize:".78rem",color:col,fontWeight:700}}>{dim.best.val}</span>
                  <span className="pat-st" style={{color:col}}>{dim.best.pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="panel">
            <div className="ptitle">⌨️ Shortcuts</div>
            <div className="kbd-grid">
              {VERDICTS.map(v => <div key={v.id} className="kbd-row"><kbd>{v.key}</kbd><span className="kd">{v.emoji} {v.label}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
