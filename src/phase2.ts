import { EnrichedContact, ScoredContact, AutoSummary, LearningOutput } from "./types";
import { classifyContact } from "./learning";

export function processCSV2(
  contacts: EnrichedContact[],
  profile: LearningOutput["profile"]
): AutoSummary {
  const approved:  ScoredContact[] = [];
  const rejected:  ScoredContact[] = [];
  const uncertain: ScoredContact[] = [];

  for (const c of contacts) {
    const { decision, score } = classifyContact(c, profile);
    const scored: ScoredContact = { ...c, autoDecision: decision, autoScore: score };
    if (decision === "approve")    approved.push(scored);
    else if (decision === "reject") rejected.push(scored);
    else                           uncertain.push(scored);
  }

  uncertain.sort((a, b) => b.autoScore - a.autoScore);
  return { approved, rejected, uncertain };
}

export function automationRate(summary: AutoSummary): number {
  const total = summary.approved.length + summary.rejected.length + summary.uncertain.length;
  if (!total) return 0;
  return Math.round(((summary.approved.length + summary.rejected.length) / total) * 100);
}
