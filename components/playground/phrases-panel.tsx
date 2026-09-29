import type { PhraseFinding } from "@/lib/findings";
import { cn } from "@/lib/utils";

import { SectionLabel } from "./section-label";

const STATUS_LABEL = { exact: "used", words: "words used", none: "not used" } as const;

/** The market's local search phrases, each marked by whether the native listing uses it. */
export function PhrasesPanel({
  phrases,
  source,
  capturedAt,
  country,
}: {
  phrases: PhraseFinding[];
  source: string;
  capturedAt: string;
  country: string;
}) {
  const used = phrases.filter((p) => p.status === "exact").length;
  return (
    <div className="p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SectionLabel>What people in {country} search</SectionLabel>
        <p className="text-xs text-muted-foreground">
          {source}, captured {new Date(capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
          <span className="text-foreground">
            {used} of {phrases.length} used
          </span>
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {phrases.map((p) => (
          <li
            key={p.phrase}
            title={`${STATUS_LABEL[p.status]}${p.fields.length ? ` · ${p.fields.join(", ")}` : ""}`}
            className={cn(
              "inline-flex items-center gap-1.5 border px-2 py-1 text-[13px]",
              p.status === "exact" && "border-foreground/70 bg-foreground text-background",
              p.status === "words" && "border-foreground/40",
              p.status === "none" && "border-dashed text-muted-foreground",
            )}
          >
            {p.phrase}
            <span className="font-mono text-[10px] uppercase opacity-70">{STATUS_LABEL[p.status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
