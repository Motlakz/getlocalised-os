"use client";

import { ArrowLeft01Icon, Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COMMANDS, getCommand, type CommandId } from "@/lib/engine/commands";
import { FIELD_LABELS, LIMITS, type Field, type Preview, type Skill } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

import { CharCount } from "./char-count";

export type FieldPreviews = Partial<Record<CommandId, Preview>>;
type Picked = { command: CommandId; freeText?: string };

/** The `/` palette for one field. Picking a command shows its preview; nothing changes until Apply. */
export function CommandMenu({
  field,
  text,
  previews,
  skills,
  open,
  initialCommand,
  live,
  preparedLabel,
  liveLabel,
  runLive,
  onOpenChange,
  onApply,
  onOpenSkill,
}: {
  field: Field;
  text: string;
  /** Prepared results for this field, keyed by command. */
  previews: FieldPreviews;
  skills: Skill[];
  open: boolean;
  initialCommand?: CommandId;
  /** True when the visitor has added a key: every command and free-form instructions run live. */
  live: boolean;
  /** e.g. "Prepared result · gemini-3.5-flash-lite" */
  preparedLabel: string;
  /** e.g. "Live · Gemini" */
  liveLabel: string;
  runLive: (command: CommandId, freeText?: string) => Promise<Preview[]>;
  onOpenChange: (open: boolean) => void;
  onApply: (command: CommandId, preview: Preview) => void;
  onOpenSkill: (name: string) => void;
}) {
  const [picked, setPicked] = useState<Picked | null>(initialCommand ? { command: initialCommand } : null);
  const [query, setQuery] = useState("");

  const prepared = picked && !picked.freeText ? previews[picked.command] : undefined;
  const ready = COMMANDS.filter((c) => previews[c.id] || live);
  const locked = COMMANDS.filter((c) => !previews[c.id] && !live);

  function close() {
    setPicked(null);
    setQuery("");
    onOpenChange(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setPicked(null);
          setQuery("");
        }
        onOpenChange(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button id={`commands-${field}`} variant="outline" size="xs" aria-label={`Commands for ${FIELD_LABELS[field]}`}>
          <span className="font-mono">/</span> Commands
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,27rem)] p-0">
        {picked ? (
          <PreviewView
            key={`${picked.command}:${picked.freeText ?? ""}`}
            field={field}
            title={picked.freeText ? `“${picked.freeText}”` : (getCommand(picked.command)?.label ?? picked.command)}
            before={text}
            label={prepared ? preparedLabel : liveLabel}
            load={() => (prepared ? simulateRun(prepared) : runLive(picked.command, picked.freeText))}
            onBack={() => setPicked(null)}
            onApply={(preview) => {
              onApply(picked.command, preview);
              close();
            }}
          />
        ) : (
          <Command loop>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={live ? "Pick a command or type your own instruction…" : `Command for ${FIELD_LABELS[field].toLowerCase()}…`}
            />
            <CommandList className="max-h-80">
              <CommandEmpty>No matching command or skill.</CommandEmpty>
              {live && query.trim() && (
                <CommandGroup heading="Your instruction">
                  <CommandItem value={`custom ${query}`} onSelect={() => setPicked({ command: "custom", freeText: query.trim() })}>
                    <CommandRow label={`Run “${query.trim()}”`} description="A free-form instruction, run live on this field" />
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading="Commands">
                {ready.map((c) => (
                  <CommandItem key={c.id} value={`${c.label} ${c.description}`} onSelect={() => setPicked({ command: c.id })}>
                    <CommandRow label={c.label} description={c.description} />
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground uppercase">
                      {previews[c.id] ? "prepared" : "live"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {locked.length > 0 && (
                <CommandGroup heading="Needs a key">
                  {locked.map((c) => (
                    <CommandItem key={c.id} value={`${c.label} ${c.description}`} disabled>
                      <CommandRow label={c.label} description={c.description} />
                      <HugeiconsIcon icon={Key01Icon} strokeWidth={1.8} className="ml-auto" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Skills">
                {skills.map((s) => (
                  <CommandItem
                    key={s.name}
                    value={`skill ${s.name} ${s.description}`}
                    onSelect={() => {
                      onOpenSkill(s.name);
                      close();
                    }}
                  >
                    <CommandRow label={`/${s.name}`} description={s.description} mono />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Prepared results appear after a short running state, so they don't look as if they had always been there. */
function simulateRun(preview: Preview): Promise<Preview[]> {
  return new Promise((resolve) => setTimeout(() => resolve([preview]), 650 + Math.round(Math.random() * 550)));
}

function CommandRow({ label, description, mono }: { label: string; description: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={mono ? "font-mono text-[13px]" : "truncate font-medium"}>{label}</span>
      <span className="truncate text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

type RunState = { status: "running" } | { status: "done"; previews: Preview[] } | { status: "error"; message: string };

function PreviewView({
  field,
  title,
  before,
  label,
  load,
  onBack,
  onApply,
}: {
  field: Field;
  title: string;
  before: string;
  label: string;
  load: () => Promise<Preview[]>;
  onBack: () => void;
  onApply: (preview: Preview) => void;
}) {
  const [run, setRun] = useState<RunState>({ status: "running" });
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(0);
  const applyRef = useRef<HTMLButtonElement>(null);
  const [loadOnce] = useState(() => load);

  useEffect(() => {
    let cancelled = false;
    loadOnce().then(
      (previews) => !cancelled && setRun({ status: "done", previews }),
      (err: Error) => !cancelled && setRun({ status: "error", message: err.message }),
    );
    return () => {
      cancelled = true;
    };
  }, [attempt, loadOnce]);

  useEffect(() => {
    if (run.status === "done") applyRef.current?.focus();
  }, [run.status]);

  const chosen = run.status === "done" ? run.previews[selected] : undefined;

  return (
    <div
      className="flex max-h-[70vh] flex-col"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && chosen) {
          e.preventDefault();
          onApply(chosen);
        }
      }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon-xs" onClick={onBack} aria-label="Back to commands">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.8} />
        </Button>
        <span className="truncate font-medium">{title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">· {FIELD_LABELS[field]}</span>
      </div>

      <div className="space-y-3 overflow-y-auto p-3 text-sm" aria-live="polite" aria-busy={run.status === "running"}>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Now</span>
            <CharCount count={before.length} limit={LIMITS[field]} />
          </div>
          <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">{before}</p>
        </div>

        {run.status === "running" && (
          <div className="border-l-2 border-foreground pl-3">
            <p className="mb-2 text-xs font-medium">Running…</p>
            <div className="space-y-2 py-1" aria-hidden>
              {[92, 78, field === "title" ? 0 : 64].filter(Boolean).map((w) => (
                <div key={w} className="h-3 animate-pulse bg-muted" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {run.status === "error" && (
          <div className="border-l-2 border-danger pl-3">
            <p className="font-mono text-[11px] font-semibold text-danger uppercase">Didn&apos;t run</p>
            <p className="mt-1">{run.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">The field is unchanged. Prepared commands still work.</p>
          </div>
        )}

        {run.status === "done" &&
          run.previews.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "block w-full animate-in border-l-2 pl-3 text-left duration-300 fade-in slide-in-from-bottom-1",
                i === selected ? "border-foreground" : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <span className="mb-1 flex justify-between text-xs">
                <span className="font-medium">{run.previews.length > 1 ? `Option ${i + 1}` : "Preview"}</span>
                <CharCount count={p.text.length} limit={LIMITS[field]} />
              </span>
              <span className="block whitespace-pre-wrap">{p.text}</span>
              {i === selected && p.notes.length > 0 && (
                <span className="mt-2 block space-y-1 text-xs text-muted-foreground">
                  {p.notes.map((n) => (
                    <span key={n.term} className="block">
                      <span className="font-semibold text-foreground">{n.term}</span> — {n.why}
                    </span>
                  ))}
                </span>
              )}
            </button>
          ))}
      </div>

      <div className="flex items-center justify-end gap-2 border-t p-2">
        <span className="mr-auto truncate pl-1 font-mono text-[10px] text-muted-foreground">{label}</span>
        {run.status === "error" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRun({ status: "running" });
              setAttempt((a) => a + 1);
            }}
          >
            Try again
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Back
            </Button>
            <Button ref={applyRef} size="sm" onClick={() => chosen && onApply(chosen)} disabled={!chosen}>
              Apply
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
