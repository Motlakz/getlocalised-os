"use client";

import { FIELD_LABELS, LIMITS, type Field } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

import { CharCount } from "./char-count";
import { CopyButton } from "./copy-button";

/** One listing field: English source on the left, the editable native text on the right. */
export function FieldRow({
  field,
  source,
  value,
  language,
  onChange,
  onSlash,
  onFocus,
  applied,
  actions,
}: {
  field: Field;
  source: string;
  value: string;
  language: string;
  onChange: (value: string) => void;
  /** Typing `/` at the start of the field or after a space opens the command menu. */
  onSlash: () => void;
  onFocus: () => void;
  /** Label of the command last applied to this field, if any. */
  applied?: string;
  actions?: React.ReactNode;
}) {
  const long = field === "full";
  const text = cn(
    "w-full whitespace-pre-wrap text-[15px] leading-relaxed",
    field === "title" && "font-heading text-lg font-semibold leading-snug",
    long && "max-h-[26rem] overflow-y-auto",
  );
  return (
    <div className="grid border-t md:grid-cols-2">
      <div className="border-b p-4 md:border-r md:border-b-0 md:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {FIELD_LABELS[field]} <span className="font-mono">· en-US</span>
          </span>
          <CharCount count={source.length} limit={LIMITS[field]} />
        </div>
        <div className={cn(text, "text-muted-foreground")}>{source}</div>
      </div>

      <div className="bg-card p-4 md:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium">
            {FIELD_LABELS[field]} <span className="font-mono text-muted-foreground">· {language}</span>
            {applied && <span className="ml-2 border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">{applied}</span>}
          </span>
          <div className="flex items-center gap-1">
            <CharCount count={value.length} limit={LIMITS[field]} className="mr-1" />
            {actions}
            <CopyButton text={value} label={FIELD_LABELS[field]} />
          </div>
        </div>
        <textarea
          aria-label={`${FIELD_LABELS[field]} in ${language}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            const el = e.currentTarget;
            const before = el.value.slice(0, el.selectionStart ?? 0);
            if (e.key === "/" && !e.ctrlKey && !e.metaKey && (before === "" || /\s$/.test(before))) {
              e.preventDefault();
              onSlash();
            }
          }}
          spellCheck={false}
          className={cn(
            text,
            "field-sizing-content resize-none bg-transparent outline-none focus-visible:ring-1 focus-visible:ring-ring/40",
          )}
        />
      </div>
    </div>
  );
}
