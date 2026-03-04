import React, { useMemo } from "react";
import { Decision } from "../types";
import { computeLearning } from "../learning";

export const PatternPanel: React.FC<{ decisions: Decision[] }> = ({ decisions }) => {
  const learning = useMemo(() => computeLearning(decisions), [decisions]);
  if (!learning || decisions.length < 3) return null;
  return (
    <div className="panel">
      <div className="ptitle">🧠 Live ICP Patterns</div>
      {learning.patterns.map(r => {
        const col = r.pct > 60 ? "#22c55e" : r.pct > 35 ? "#f59e0b" : "#ef4444";
        return (
          <div key={r.lbl} className="pat-row">
            <span className="pat-lbl">{r.lbl}</span>
            <div className="pat-bw"><div className="pat-b" style={{width:`${r.pct}%`,background:col}} /></div>
            <span className="pat-st" style={{color:col}}>{r.pct}%</span>
          </div>
        );
      })}
    </div>
  );
};
