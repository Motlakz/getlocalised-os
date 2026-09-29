"use client";

import { Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { COMMANDS, type CommandId } from "@/lib/engine/commands";
import { FIELD_LABELS, type Field } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

import { SectionLabel } from "./section-label";

/** Top right: every command with what it does. Ready ones run on the field you last worked in. */
export function CommandsRail({
  activeField,
  isReady,
  onRun,
}: {
  activeField: Field;
  isReady: (command: CommandId) => boolean;
  onRun: (command: CommandId) => void;
}) {
  return (
    <div className="p-4 md:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <SectionLabel>Commands</SectionLabel>
        <span className="text-xs text-muted-foreground">
          on <span className="text-foreground">{FIELD_LABELS[activeField].toLowerCase()}</span> · type{" "}
          <kbd className="border px-1 font-mono text-[11px]">/</kbd> in a field
        </span>
      </div>
      <ul className="-mx-2">
        {COMMANDS.map((c) => {
          const ready = isReady(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={!ready}
                onClick={() => onRun(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-2 py-1.5 text-left text-sm",
                  ready ? "hover:bg-muted" : "cursor-not-allowed opacity-55",
                )}
              >
                <span className="w-36 shrink-0 font-medium">{c.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{c.description}</span>
                {!ready && (
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
                    <HugeiconsIcon icon={Key01Icon} strokeWidth={1.8} className="size-3" /> key
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
