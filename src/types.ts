export type VerdictId =
  | "strong_yes"
  | "yes_exc"
  | "pat_only"
  | "soft_no"
  | "hard_no"
  | "skip";

export type AutoDecision = "approve" | "reject" | "uncertain";

export interface EnrichedContact {
  id: number;
  fn: string;
  ln: string;
  title: string;
  co: string;
  linkedin: string;
  email: string;
  phone: string;
  sen: string;
  senS: number;
  dept: string;
  size: string;
  ind: string;
  tags: string[];
  icp: number;
}

export interface ScoredContact extends EnrichedContact {
  autoDecision: AutoDecision;
  autoScore: number;
}

export interface VerdictMeta {
  id: VerdictId;
  label: string;
  emoji: string;
  sub: string;
  cls: string;
  key: string;
  anim: string;
  flCls: string;
  hbCls: string;
  bbCls: string;
  pFit: 0 | 1;
  persF: 0 | 1;
}

export interface Decision {
  ts: string;
  c: EnrichedContact;
  verdict: VerdictId;
  note: string;
  pFit: 0 | 1;
  persF: 0 | 1;
  autoScore?: number;
  source?: "manual" | "auto_approve" | "auto_reject";
}

export interface PatternRow {
  lbl: string;
  yes: number;
  total: number;
  pct: number;
}

export interface DimProfile {
  val: string;
  yes: number;
  total: number;
  pct: number;
}

export interface LearningOutput {
  profile: Record<string, { label: string; ranked: DimProfile[]; best: DimProfile | null }>;
  patterns: PatternRow[];
  autoScored: Decision[];
}

export interface AutoSummary {
  approved: ScoredContact[];
  rejected: ScoredContact[];
  uncertain: ScoredContact[];
}
