import { FIELD_LABELS, type Note } from "@/lib/engine/types";
import type { Findings } from "@/lib/findings";

import { SectionLabel } from "./section-label";

/** Deterministic checks on the current native text, plus the engine's notes on its word choices. */
export function FindingsPanel({ findings, notes }: { findings: Findings; notes: Note[] }) {
  const over = findings.limits.filter((l) => l.over);
  const missing = findings.phrases.filter((p) => p.status === "none");
  const issues = over.length + findings.repetition.length;

  return (
    <div className="grid gap-px bg-border md:grid-cols-2">
      <div className="bg-background p-4 md:p-5">
        <SectionLabel className="mb-3">Findings · {issues === 0 ? "no issues" : `${issues} to review`}</SectionLabel>
        <ul className="space-y-2.5 text-sm">
          {over.map((l) => (
            <li key={l.field} className="flex gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase text-danger">Limit</span>
              <span>
                {FIELD_LABELS[l.field]} is {l.count - l.limit} characters over ({l.count}/{l.limit}).
              </span>
            </li>
          ))}
          {findings.repetition.map((r) => (
            <li key={`${r.word}-${r.where}`} className="flex gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase text-warning">Repeat</span>
              <span>
                “{r.word}” appears {r.count} times in the {r.where === "full" ? "full description" : "title and short description"}. Consider
                rephrasing.
              </span>
            </li>
          ))}
          {issues === 0 && <li className="text-muted-foreground">Every field fits its limit and no word is overused.</li>}
          {missing.length > 0 && (
            <li className="flex gap-2 text-muted-foreground">
              <span className="font-mono text-[11px] font-semibold uppercase">Unused</span>
              <span>
                {missing.length} search phrase{missing.length === 1 ? " isn't" : "s aren't"} in the listing:{" "}
                {missing.map((p) => `“${p.phrase}”`).join(", ")}.
              </span>
            </li>
          )}
        </ul>
      </div>
      <div className="bg-background p-4 md:p-5">
        <SectionLabel className="mb-3">Why these terms</SectionLabel>
        <ul className="space-y-2.5 text-sm">
          {notes.map((n) => (
            <li key={n.term}>
              <span className="font-semibold">{n.term}</span>
              <span className="text-muted-foreground"> — {n.why}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
