import { useState, useMemo } from "react";
import { Decision, VerdictId, EnrichedContact, LearningOutput } from "../types";
import { VMAP } from "../verdicts";
import { computeLearning } from "../learning";
import { toCSV, toJSON, downloadFile } from "../export";

export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const learning: LearningOutput | null = useMemo(
    () => computeLearning(decisions),
    [decisions]
  );

  function addDecision(contact: EnrichedContact, verdict: VerdictId, note: string) {
    const v = VMAP[verdict];
    setDecisions(prev => [
      ...prev,
      { ts: new Date().toISOString(), c: contact, verdict, note, pFit: v.pFit, persF: v.persF, source: "manual" },
    ]);
  }

  function exportCSV() {
    downloadFile("icp_decisions.csv", toCSV(decisions, learning), "text/csv");
  }

  function exportJSON() {
    downloadFile("icp_decisions.json", toJSON(decisions, learning), "application/json");
  }

  function reset() { setDecisions([]); }

  return { decisions, learning, addDecision, exportCSV, exportJSON, reset };
}
