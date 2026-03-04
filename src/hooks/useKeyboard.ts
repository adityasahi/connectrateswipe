import { useEffect } from "react";
import { VerdictId } from "../types";
import { KEY_VERDICT } from "../verdicts";

export function useKeyboard(onVerdict: (v: VerdictId) => void, enabled: boolean) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!enabled) return;
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      const verdict = KEY_VERDICT[e.key] as VerdictId | undefined;
      if (verdict) { e.preventDefault(); onVerdict(verdict); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onVerdict, enabled]);
}
