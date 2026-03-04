import React, { useMemo } from "react";
import { Decision } from "../types";
import { VMAP } from "../verdicts";
import { computeLearning } from "../learning";

interface Props {
  decisions: Decision[];
  onRestart: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onContinuePhase2?: () => void;
}

export const LearningScreen: React.FC<Props> = ({ decisions, onRestart, onExportCSV, onExportJSON, onContinuePhase2 }) => {
  const learning = useMemo(() => computeLearning(decisions), [decisions]);
  if (!learning) return null;
  const { profile, patterns, autoScored } = learning;
  const total  = decisions.length;
  const patFit = decisions.filter(d => d.pFit).length;
  const cnt    = (v: string) => decisions.filter(d => d.verdict === v).length;
  const top5   = [...autoScored].sort((a,b) => (b.autoScore??0)-(a.autoScore??0)).slice(0,5);

  return (
    <div className="learn-screen">
      <div className="learn-header">
        <h2>✅ Phase 1 Complete</h2>
        <p>{total} decisions — {patFit} pattern fits ({Math.round((patFit/total)*100)}% match rate)</p>
      </div>
      <div className="learn-grid">
        <div className="learn-card">
          <div className="lc-title">🎯 Learned ICP Profile</div>
          {Object.values(profile).map(dim => {
            if (!dim.best) return null;
            const col = dim.best.pct > 60 ? "#22c55e" : dim.best.pct > 35 ? "#f59e0b" : "#ef4444";
            return (
              <div key={dim.label} className="prof-row">
                <span className="prof-dim">{dim.label}</span>
                <span className="prof-val" style={{color:col}}>{dim.best.val}</span>
                <span className="prof-pct" style={{color:col}}>{dim.best.pct}%</span>
              </div>
            );
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">📊 Pattern Fit Rates</div>
          {patterns.map(r => {
            const col = r.pct > 60 ? "#22c55e" : r.pct > 35 ? "#f59e0b" : "#ef4444";
            return (
              <div key={r.lbl} className="trait-row">
                <span className="tr-lbl">{r.lbl}</span>
                <div className="tr-bw"><div className="tr-b" style={{width:`${r.pct}%`,background:col}} /></div>
                <span className="tr-pct" style={{color:col}}>{r.pct}%</span>
              </div>
            );
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">🗳️ Decision Breakdown</div>
          <div className="verdict-summary">
            {[["strong_yes","🎯","c-gy","Strong Yes"],["yes_exc","✅","c-ye","Exception"],
              ["pat_only","📐","c-po","Pattern"],["soft_no","🤔","c-sn","Soft No"],
              ["hard_no","❌","c-hn","Hard No"],["skip","⏭️","","Skipped"]].map(([v,e,c,l]) => (
              <div key={v} className="vs-item">
                <div className={`vs-num ${c}`}>{cnt(v)}</div>
                <div className="vs-lbl">{e} {l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="learn-card">
          <div className="lc-title">🤖 Auto-score Preview</div>
          <table className="score-table">
            <thead><tr><th>Contact</th><th>Verdict</th><th>Score</th></tr></thead>
            <tbody>
              {top5.map((d,i) => {
                const v = VMAP[d.verdict];
                const col = (d.autoScore??0)>=70?"#22c55e":(d.autoScore??0)>=45?"#f59e0b":"#ef4444";
                return (
                  <tr key={i}>
                    <td style={{fontWeight:600}}>{d.c.fn} {d.c.ln}<br/>
                      <span style={{fontWeight:400,color:"var(--muted)",fontSize:".68rem"}}>{d.c.title}</span></td>
                    <td><span className={`sc-label ${v.bbCls}`}>{v.emoji} {v.label}</span></td>
                    <td>
                      <div style={{fontSize:".85rem",fontWeight:700,color:col}}>{d.autoScore}</div>
                      <div className="sc-bar"><div className="sc-fill" style={{width:`${d.autoScore}%`,background:col}} /></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="export-row">
        {onContinuePhase2 && (
          <button className="ebtn p" style={{fontSize:"1rem",padding:"13px 28px"}} onClick={onContinuePhase2}>
            Continue to Phase 2 → Upload CSV 2
          </button>
        )}
        <button className="ebtn s" onClick={onExportCSV}>⬇️ Export CSV</button>
        <button className="ebtn s" onClick={onExportJSON}>⬇️ Export JSON</button>
        <button className="restart-btn" onClick={onRestart}>↩ Start Over</button>
      </div>
    </div>
  );
};
