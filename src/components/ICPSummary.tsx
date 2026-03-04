import React, { useMemo } from "react";
import { Decision } from "../types";
import { computeLearning } from "../learning";
import { toCSV, toJSON, downloadFile } from "../export";

interface Props {
  phase1Decisions: Decision[];
  phase2Decisions: Decision[];
  onRestart: () => void;
}

export const ICPSummary: React.FC<Props> = ({ phase1Decisions, phase2Decisions, onRestart }) => {
  const allDecisions = [...phase1Decisions, ...phase2Decisions];
  const learning = useMemo(() => computeLearning(allDecisions), [allDecisions]);
  if (!learning) return null;

  const { profile, patterns } = learning;
  const autoApproved = phase2Decisions.filter(d => d.source === "auto_approve").length;
  const autoRejected = phase2Decisions.filter(d => d.source === "auto_reject").length;
  const manualP2     = phase2Decisions.filter(d => d.source === "manual").length;
  const autoRate     = phase2Decisions.length
    ? Math.round(((autoApproved + autoRejected) / phase2Decisions.length) * 100) : 0;

  const topTitles = (() => {
    const m: Record<string,{yes:number;total:number}> = {};
    for (const d of allDecisions) {
      if (!m[d.c.title]) m[d.c.title] = {yes:0,total:0};
      m[d.c.title].total++;
      if (d.pFit) m[d.c.title].yes++;
    }
    return Object.entries(m)
      .filter(([,v]) => v.total >= 2)
      .map(([title,v]) => ({title, pct: Math.round((v.yes/v.total)*100), total: v.total}))
      .sort((a,b) => b.pct - a.pct || b.total - a.total)
      .slice(0,8);
  })();

  return (
    <div className="learn-screen">
      <div className="learn-header">
        <h2>🧠 Full ICP Profile — Phase 3</h2>
        <p>Patterns learned across both CSVs ({allDecisions.length} total decisions)</p>
      </div>
      <div className="auto-recap">
        {[
          [autoApproved,"#22c55e","Auto-Approved"],
          [autoRejected,"#ef4444","Auto-Rejected"],
          [manualP2,    "#f59e0b","Manual Review"],
          [`${autoRate}%`,"#a78bfa","Automation Rate"],
        ].map(([n,col,lbl],i,arr) => (
          <React.Fragment key={String(lbl)}>
            <div className="recap-item">
              <span className="recap-num" style={{color:String(col)}}>{n}</span>
              <span className="recap-lbl">{lbl}</span>
            </div>
            {i < arr.length-1 && <div className="recap-divider" />}
          </React.Fragment>
        ))}
      </div>
      <div className="learn-grid">
        <div className="learn-card">
          <div className="lc-title">🎯 Best ICP Values Per Dimension</div>
          {Object.values(profile).map(dim => {
            if (!dim.best) return null;
            const col = dim.best.pct>60?"#22c55e":dim.best.pct>35?"#f59e0b":"#ef4444";
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
          <div className="lc-title">👔 Seniority Fit Rates</div>
          {(profile["sen"]?.ranked||[]).map(r => {
            const col=r.pct>60?"#22c55e":r.pct>35?"#f59e0b":"#ef4444";
            return <div key={r.val} className="trait-row">
              <span className="tr-lbl">{r.val}</span>
              <div className="tr-bw"><div className="tr-b" style={{width:`${r.pct}%`,background:col}} /></div>
              <span className="tr-pct" style={{color:col}}>{r.pct}%</span>
            </div>;
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">🏢 Department Fit Rates</div>
          {(profile["dept"]?.ranked||[]).map(r => {
            const col=r.pct>60?"#22c55e":r.pct>35?"#f59e0b":"#ef4444";
            return <div key={r.val} className="trait-row">
              <span className="tr-lbl">{r.val}</span>
              <div className="tr-bw"><div className="tr-b" style={{width:`${r.pct}%`,background:col}} /></div>
              <span className="tr-pct" style={{color:col}}>{r.pct}%</span>
            </div>;
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">📋 Top Approved Titles</div>
          {topTitles.map(t => {
            const col=t.pct>60?"#22c55e":t.pct>35?"#f59e0b":"#ef4444";
            return <div key={t.title} className="trait-row">
              <span className="tr-lbl" style={{fontSize:".7rem"}}>{t.title}</span>
              <div className="tr-bw"><div className="tr-b" style={{width:`${t.pct}%`,background:col}} /></div>
              <span className="tr-pct" style={{color:col}}>{t.pct}%</span>
            </div>;
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">📊 Pattern Fit Rates</div>
          {patterns.map(r => {
            const col=r.pct>60?"#22c55e":r.pct>35?"#f59e0b":"#ef4444";
            return <div key={r.lbl} className="trait-row">
              <span className="tr-lbl">{r.lbl}</span>
              <div className="tr-bw"><div className="tr-b" style={{width:`${r.pct}%`,background:col}} /></div>
              <span className="tr-pct" style={{color:col}}>{r.pct}%</span>
            </div>;
          })}
        </div>
        <div className="learn-card">
          <div className="lc-title">🤖 Derived Auto-Decision Rules</div>
          <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
            {Object.values(profile).filter(d=>d.best&&d.best.pct>=60).map(d=>(
              <div key={d.label} style={{fontSize:".82rem",padding:"6px 10px",background:"rgba(34,197,94,.08)",borderRadius:"7px",border:"1px solid rgba(34,197,94,.15)"}}>
                ✓ <b>{d.label}</b> = <span style={{color:"#4ade80"}}>{d.best!.val}</span>
                <span style={{color:"var(--muted)",fontSize:".72rem"}}> ({d.best!.pct}%)</span>
              </div>
            ))}
            {Object.values(profile).map(d => {
              const w = d.ranked[d.ranked.length-1];
              return w && w.pct < 25 ? (
                <div key={d.label+"w"} style={{fontSize:".82rem",padding:"6px 10px",background:"rgba(239,68,68,.08)",borderRadius:"7px",border:"1px solid rgba(239,68,68,.15)"}}>
                  ✗ <b>{d.label}</b> = <span style={{color:"#f87171"}}>{w.val}</span>
                  <span style={{color:"var(--muted)",fontSize:".72rem"}}> ({w.pct}%)</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
      <div className="export-row">
        <button className="ebtn p" onClick={()=>downloadFile("icp_all_decisions.csv",toCSV(allDecisions,learning),"text/csv")}>⬇️ Export All CSV</button>
        <button className="ebtn s" onClick={()=>downloadFile("icp_profile.json",toJSON(allDecisions,learning),"application/json")}>⬇️ Export ICP JSON</button>
        <button className="restart-btn" onClick={onRestart}>↩ Start Over</button>
      </div>
    </div>
  );
};
