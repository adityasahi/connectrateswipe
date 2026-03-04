import { Decision, LearningOutput } from "./types";

export function toCSV(decisions: Decision[], learning: LearningOutput | null): string {
  const headers = [
    "timestamp","contact_id","first_name","last_name","title","company",
    "linkedin","email","phone",
    "seniority","seniority_score","department","company_size","industry",
    "persona_tags","icp_score_enriched","auto_icp_score_learned",
    "verdict","rep_note","is_pattern_fit","is_person_fit","source"
  ];
  const rows = decisions.map((d, i) => {
    const as = learning?.autoScored[i]?.autoScore ?? 0;
    return [
      d.ts, d.c.id, d.c.fn, d.c.ln, d.c.title, d.c.co,
      d.c.linkedin, d.c.email, d.c.phone,
      d.c.sen, d.c.senS, d.c.dept, d.c.size, d.c.ind,
      d.c.tags.join("|"), d.c.icp, as,
      d.verdict, d.note, d.pFit, d.persF, d.source || "manual",
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export function toJSON(decisions: Decision[], learning: LearningOutput | null): string {
  return JSON.stringify({
    exported: new Date().toISOString(),
    total_reviewed: decisions.length,
    icp_profile: learning
      ? Object.fromEntries(Object.entries(learning.profile).map(([k,v]) => [k, v.best]))
      : null,
    pattern_fit_rates: learning?.patterns,
    decisions: decisions.map(d => ({
      ...d,
      contact: {
        name:     `${d.c.fn} ${d.c.ln}`,
        title:    d.c.title,
        company:  d.c.co,
        linkedin: d.c.linkedin,
        email:    d.c.email,
        phone:    d.c.phone,
        seniority: d.c.sen,
        department: d.c.dept,
        size:     d.c.size,
        industry: d.c.ind,
        icp_score: d.c.icp,
      }
    })),
  }, null, 2);
}

export function downloadFile(name: string, content: string, type: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
}
