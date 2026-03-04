import React, { useState } from "react";
import { EnrichedContact } from "../types";
import { parseCSV } from "../csvParser";
import { enrichRow } from "../enrichment";

const DEMO_CSV = `First Name,Last Name,Title,Company
Sarah,Chen,VP of Sales,Stripe
Michael,Torres,Chief Revenue Officer,HubSpot
Emily,Johnson,Sales Development Representative,Salesforce
James,Williams,Director of Business Development,Twilio
Lisa,Patel,Account Executive,Zoom
Robert,Kim,Head of Growth,Figma
Amanda,Martinez,Marketing Manager,Canva
David,Lee,Software Engineer,Google
Jennifer,Brown,CFO,Airbnb
Chris,Davis,VP of Engineering,Netflix
Megan,Wilson,Product Manager,Spotify
Kevin,Anderson,Enterprise Account Executive,Snowflake
Rachel,Taylor,CEO,Linear
Brandon,Thomas,SDR Manager,Outreach
Stephanie,Jackson,Director of Marketing,Notion
Tyler,White,Sales Engineer,Databricks
Nicole,Harris,Customer Success Manager,Zendesk
Andrew,Clark,Head of Sales,Loom
Brittany,Lewis,Regional Sales Manager,Gong
Jonathan,Robinson,VP of Marketing,Amplitude`;

interface Props { onLoad: (contacts: EnrichedContact[]) => void; }

export const UploadScreen: React.FC<Props> = ({ onLoad }) => {
  const [drag, setDrag] = useState(false);
  const [err,  setErr]  = useState("");

  function processText(text: string) {
    const res = parseCSV(text);
    if (res.error) { setErr(res.error); return; }
    const contacts = res.rows!.map(enrichRow).filter(c => c.fn || c.ln);
    if (!contacts.length) { setErr("No valid contacts found."); return; }
    onLoad(contacts);
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

  return (
    <div className="upload-screen">
      <div className="upload-box">
        <div className="upload-hero">
          <h1>Upload your CSV.<br /><span>Swipe. Let the system learn.</span></h1>
          <p>Drop your contact list — the system will enrich it and start learning your ICP from every swipe.</p>
        </div>
        <div
          className={`drop-zone${drag ? " dragover" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
          <div className="drop-icon">📂</div>
          <div className="drop-title">Drop your CSV here or click to browse</div>
          <div className="drop-sub">Only 4 columns required:</div>
          <div className="drop-badge">
            {["First Name","Last Name","Title","Company"].map(f => (
              <span key={f} className="field-pill">{f}</span>
            ))}
          </div>
        </div>
        {err && <div className="parse-error">⚠️ {err}</div>}
        <div className="upload-or">or</div>
        <button className="demo-btn" onClick={() => processText(DEMO_CSV)}>
          🚀 &nbsp;Load demo contacts and try it now
        </button>
        <div className="format-hint">
          <h4>Expected CSV format</h4>
          <div className="csv-preview">
            <div className="header">First Name,Last Name,Title,Company</div>
            <div className="row">Sarah,Chen,VP of Sales,Stripe</div>
            <div className="row">Michael,Torres,Chief Revenue Officer,HubSpot</div>
          </div>
        </div>
      </div>
    </div>
  );
};
