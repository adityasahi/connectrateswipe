import React, { useState, useEffect, useRef } from "react";
import { EnrichedContact, VerdictId } from "../types";
import { VERDICTS } from "../verdicts";

const GRADIENTS = [
  ["#7c6bff","#a78bfa"],["#3b82f6","#60a5fa"],["#10b981","#34d399"],
  ["#f59e0b","#fbbf24"],["#ef4444","#f87171"],["#8b5cf6","#c084fc"],
];

function Avatar({ fn, ln, id }: { fn:string; ln:string; id:number }) {
  const [a,b] = GRADIENTS[id % GRADIENTS.length];
  return <div className="avatar" style={{background:`linear-gradient(135deg,${a},${b})`}}>{(fn||"?")[0]}{(ln||"")[0]}</div>;
}

interface Props {
  contact: EnrichedContact;
  onDecide: (verdict: VerdictId, note: string) => void;
  animClass: string;
  isAnimating: boolean;
}

export const ContactCard: React.FC<Props> = ({ contact, onDecide, animClass, isAnimating }) => {
  const [note, setNote] = useState("");
  const cardEl = useRef<HTMLDivElement>(null);
  const drag   = useRef({ on:false, sx:0 });

  useEffect(() => setNote(""), [contact.id]);

  const senW = [0,20,40,60,80,100][contact.senS] ?? 20;
  const senC = ["","#ef4444","#f59e0b","#60a5fa","#a78bfa","#7c6bff"][contact.senS];
  const icpC = contact.icp >= 70 ? "#22c55e" : contact.icp >= 45 ? "#f59e0b" : "#ef4444";

  function onPD(e: React.PointerEvent) {
    if (isAnimating || ["TEXTAREA","BUTTON","A"].includes((e.target as HTMLElement).tagName)) return;
    drag.current = { on:true, sx:e.clientX };
    cardEl.current?.setPointerCapture(e.pointerId);
  }
  function onPM(e: React.PointerEvent) {
    if (!drag.current.on || !cardEl.current) return;
    const dx = e.clientX - drag.current.sx;
    cardEl.current.style.transform  = `translate(${dx*0.35}px) rotate(${dx*0.05}deg)`;
    cardEl.current.style.transition = "none";
    const yh = cardEl.current.querySelector<HTMLElement>(".drag-hint.yes");
    const nh = cardEl.current.querySelector<HTMLElement>(".drag-hint.no");
    if (yh) yh.style.opacity = String(Math.max(0, Math.min(1, dx/80)));
    if (nh) nh.style.opacity = String(Math.max(0, Math.min(1, -dx/80)));
  }
  function onPU(e: React.PointerEvent) {
    if (!drag.current.on || !cardEl.current) return;
    drag.current.on = false;
    const dx = e.clientX - drag.current.sx;
    cardEl.current.style.transform  = "";
    cardEl.current.style.transition = "";
    const yh = cardEl.current.querySelector<HTMLElement>(".drag-hint.yes");
    const nh = cardEl.current.querySelector<HTMLElement>(".drag-hint.no");
    if (yh) yh.style.opacity = "0";
    if (nh) nh.style.opacity = "0";
    if (dx >  90) onDecide("strong_yes", note);
    if (dx < -90) onDecide("hard_no",    note);
  }

  return (
    <div ref={cardEl} className={`contact-card ${animClass}`}
      onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU}>
      <div className="drag-hint yes">✓ Strong Yes</div>
      <div className="drag-hint no">✗ Hard No</div>

      {/* Header */}
      <div className="card-top">
        <div className="av-row">
          <Avatar fn={contact.fn} ln={contact.ln} id={contact.id} />
          <div>
            <div className="c-name">{contact.fn} {contact.ln}</div>
            <div className="c-title">{contact.title}</div>
            <div className="c-co">{contact.co}</div>
          </div>
        </div>
        <span className={`size-badge sz-${(contact.size[0]||"U")}`}>{contact.size}</span>
      </div>

      {/* Contact info row — LinkedIn, Email, Phone */}
      <div className="contact-info-row">
        {contact.linkedin && (
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="ci-link ci-li"
            onPointerDown={e => e.stopPropagation()}>
            <span className="ci-icon">🔗</span>
            <span className="ci-lbl">LinkedIn</span>
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="ci-link ci-email"
            onPointerDown={e => e.stopPropagation()}>
            <span className="ci-icon">✉️</span>
            <span className="ci-lbl">{contact.email}</span>
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="ci-link ci-phone"
            onPointerDown={e => e.stopPropagation()}>
            <span className="ci-icon">📞</span>
            <span className="ci-lbl">{contact.phone}</span>
          </a>
        )}
      </div>

      <hr className="div" />

      {/* Enriched attributes */}
      <div className="attr-grid">
        <div>
          <div className="al">Seniority</div><div className="av">{contact.sen}</div>
          <div className="sen-bar"><div className="sen-fill" style={{width:`${senW}%`,background:senC}} /></div>
        </div>
        <div><div className="al">Department</div><div className="av">{contact.dept}</div></div>
        <div><div className="al">Industry</div><div className="av">{contact.ind}</div></div>
        <div><div className="al">Company Size</div><div className="av">{contact.size}</div></div>
      </div>

      <div style={{marginBottom:"10px"}}>
        <div className="al" style={{marginBottom:"4px"}}>Persona Tags</div>
        <div className="tags">{contact.tags.map(t => <span key={t} className="ptag">{t}</span>)}</div>
      </div>

      <div className="icp-row" style={{marginBottom:"10px"}}>
        <span className="icp-lbl">ICP Score</span>
        <div className="icp-bar"><div className="icp-fill" style={{width:`${contact.icp}%`,background:icpC}} /></div>
        <span className="icp-num" style={{color:icpC}}>{contact.icp}</span>
      </div>

      <div className="note-lbl">Rep Note (optional)</div>
      <textarea className="note-inp" rows={2} placeholder="e.g. 'Title is right but company too small'"
        value={note} onChange={e => setNote(e.target.value)} />

      <div className="verd-title">Your verdict — swipe or click</div>
      <div className="verd-grid">
        {VERDICTS.map(v => (
          <button key={v.id} className={`vbtn ${v.cls}`} disabled={isAnimating} onClick={() => onDecide(v.id, note)}>
            <span className="vk">{v.key}</span>
            <span className="ve">{v.emoji}</span>
            <span className="vl">{v.label}</span>
            <span className="vs">{v.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
