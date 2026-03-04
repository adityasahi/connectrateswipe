import React, { useState } from "react";
import { EnrichedContact, LearningOutput, AutoSummary } from "../types";
import { parseCSV } from "../csvParser";
import { enrichRow } from "../enrichment";
import { processCSV2, automationRate } from "../phase2";

interface Props { learning: LearningOutput; onReady: (summary: AutoSummary) => void; }

export const Phase2Gate: React.FC<Props> = ({ learning, onReady }) => {
  const [drag, setDrag]       = useState(false);
  const [err,  setErr]        = useState("");
  const [preview, setPreview] = useState<AutoSummary | null>(null);

  function processText(text: string) {
    const res = parseCSV(text);
    if (res.error) { setErr(res.error); return; }
    const contacts: EnrichedContact[] = res.rows!.map(enrichRow).filter(c => c.fn || c.ln);
    if (!contacts.length) { setErr("No valid contacts found."); return; }
    setPreview(processCSV2(contacts, learning.profile));
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => processText(ev.target!.result as string); r.readAsText(file);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => processText(ev.target!.result as string); r.readAsText(file);
  }

  const rate = preview ? automationRate(preview) : 0;
  const total = preview ? preview.approved.length + preview.rejected.length + preview.uncertain.length : 0;

  return (
    <div className="phase2-gate">
      <div className="pg-header">
        <div className="pg-badge">Phase 2</div>
        <h2>Automate With Memory</h2>
        <p>Upload CSV 2 — the system auto-approves and auto-rejects based on Phase 1 patterns. Only uncertain contacts need your input.</p>
      </div>
      {!preview ? (
        <>
          <div className={`drop-zone${drag?" dragover":""}`}
            onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}>
            <input type="file" accept=".csv,text/csv" onChange={onFile} />
            <div className="drop-icon">📂</div>
            <div className="drop-title">Drop CSV 2 here or click to browse</div>
            <div className="drop-sub">Same format: First Name, Last Name, Title, Company</div>
          </div>
          {err && <div className="parse-error">⚠️ {err}</div>}
        </>
      ) : (
        <div className="pg-results">
          <div className="rate-banner">
            <div className="rate-circle">
              <svg viewBox="0 0 36 36" className="rate-svg">
                <path className="rate-bg"   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"/>
                <path className="rate-fill" strokeDasharray={`${rate}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <div className="rate-num">{rate}%</div>
            </div>
            <div className="rate-label">
              <div className="rate-title">Automation Rate</div>
              <div className="rate-sub">{preview.approved.length + preview.rejected.length} of {total} contacts handled automatically</div>
            </div>
          </div>
          <div className="bucket-grid">
            {[
              { b: preview.approved,  cls:"approved",  icon:"✅", lbl:"Auto-Approved", sub:"Strong ICP match",       sc:"g" },
              { b: preview.uncertain, cls:"uncertain",  icon:"🤔", lbl:"Needs Your Input", sub:"Too close to call",   sc:"a" },
              { b: preview.rejected,  cls:"rejected",   icon:"❌", lbl:"Auto-Rejected", sub:"Doesn't fit ICP",        sc:"r" },
            ].map(({ b, cls, icon, lbl, sub, sc }) => (
              <div key={cls} className={`bucket ${cls}`}>
                <div className="bucket-icon">{icon}</div>
                <div className="bucket-num">{b.length}</div>
                <div className="bucket-lbl">{lbl}</div>
                <div className="bucket-sub">{sub}</div>
                <div className="bucket-list">
                  {b.slice(0,4).map(c => (
                    <div key={c.id} className="bucket-row">
                      <span className="br-name">{c.fn} {c.ln}</span>
                      <span className={`br-score ${sc}`}>{c.autoScore}</span>
                    </div>
                  ))}
                  {b.length > 4 && <div className="bucket-more">+{b.length - 4} more</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="pg-actions">
            <button className="ebtn p" onClick={() => onReady(preview)}>
              {preview.uncertain.length > 0
                ? `Review ${preview.uncertain.length} uncertain contacts →`
                : "All done — view results →"}
            </button>
            <button className="ebtn s" onClick={() => { setPreview(null); setErr(""); }}>← Upload different CSV</button>
          </div>
        </div>
      )}
    </div>
  );
};
