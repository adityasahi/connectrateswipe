import { Decision, LearningOutput, DimProfile, PatternRow } from "./types";

type Dim = "sen" | "dept" | "size" | "ind";
const DIM_LABELS: Record<Dim, string> = {
  sen:"Seniority", dept:"Department", size:"Company Size", ind:"Industry"
};
const DIMS: Dim[] = ["sen","dept","size","ind"];
const DIM_WEIGHTS: Record<Dim, number> = { sen:0.35, dept:0.30, size:0.20, ind:0.15 };

export const AUTO_APPROVE_THRESHOLD = 68;
export const AUTO_REJECT_THRESHOLD  = 32;
export const MIN_SAMPLE_SIZE        = 2;

function fitRate(group: Decision[]) {
  const yes = group.filter(d => d.pFit).length;
  return { yes, total: group.length, pct: Math.round((yes / group.length) * 100) };
}

export function computeLearning(decisions: Decision[]): LearningOutput | null {
  if (!decisions.length) return null;

  const profile = {} as LearningOutput["profile"];
  for (const dim of DIMS) {
    const groups: Record<string, Decision[]> = {};
    for (const d of decisions) {
      const val = (d.c as any)[dim] as string || "Unknown";
      if (!groups[val]) groups[val] = [];
      groups[val].push(d);
    }
    const ranked: DimProfile[] = Object.entries(groups)
      .map(([val, grp]) => ({ val, ...fitRate(grp) }))
      .filter(r => r.total >= MIN_SAMPLE_SIZE)
      .sort((a, b) => b.pct - a.pct || b.total - a.total);
    profile[dim] = { label: DIM_LABELS[dim], ranked, best: ranked[0] || null };
  }

  const patternDefs = [
    { lbl:"C-Suite & VP",         fn:(d:Decision) => ["C-Suite","VP"].includes(d.c.sen) },
    { lbl:"Sales / RevOps",       fn:(d:Decision) => ["Sales","Operations"].includes(d.c.dept) },
    { lbl:"Enterprise / Large",   fn:(d:Decision) => ["Enterprise","Large"].includes(d.c.size) },
    { lbl:"Sales Tech / MarTech", fn:(d:Decision) => ["Sales Tech","CRM/MarTech"].includes(d.c.ind) },
    { lbl:"Director / Head",      fn:(d:Decision) => d.c.sen === "Director/Head" },
    { lbl:"Mid-size company",     fn:(d:Decision) => d.c.size === "Mid" },
  ];
  const patterns: PatternRow[] = patternDefs
    .map(g => {
      const sub = decisions.filter(g.fn);
      if (!sub.length) return null;
      const { yes, total, pct } = fitRate(sub);
      return { lbl: g.lbl, yes, total, pct };
    })
    .filter(Boolean) as PatternRow[];

  const autoScored = decisions.map(d => ({
    ...d, autoScore: scoreContact(d.c, profile),
  }));

  return { profile, patterns, autoScored };
}

export function scoreContact(
  contact: { sen:string; dept:string; size:string; ind:string },
  profile: LearningOutput["profile"]
): number {
  let wSum = 0, wTotal = 0;
  for (const dim of DIMS) {
    const val = (contact as any)[dim] as string;
    const entry = profile[dim]?.ranked.find(r => r.val === val);
    if (entry) { wSum += entry.pct * DIM_WEIGHTS[dim]; wTotal += DIM_WEIGHTS[dim]; }
  }
  return wTotal > 0 ? Math.round(wSum / wTotal) : 50;
}

export function classifyContact(
  contact: { sen:string; dept:string; size:string; ind:string },
  profile: LearningOutput["profile"]
): { decision: "approve" | "reject" | "uncertain"; score: number } {
  const score = scoreContact(contact, profile);
  if (score >= AUTO_APPROVE_THRESHOLD) return { decision:"approve",   score };
  if (score <= AUTO_REJECT_THRESHOLD)  return { decision:"reject",    score };
  return                                      { decision:"uncertain", score };
}
