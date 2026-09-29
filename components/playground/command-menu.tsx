"use client";

import { ArrowLeft01Icon, Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COMMANDS, type Command as EngineCommand, type CommandId } from "@/lib/engine/commands";
import { FIELD_LABELS, LIMITS, type Field, type Preview, type Skill } from "@/lib/engine/types";

import { CharCount } from "./char-count";

export type FieldPreviews = Partial<Record<CommandId, Preview>>;

/** The `/` palette for one field. Picking a command shows its preview; nothing changes until Apply. */
export function CommandMenu({
  field,
  text,
  previews,
  skills,
  open,
  initialCommand,
  onOpenChange,
  onApply,
  onOpenSkill,
}: {
  field: Field;
  text: string;
  previews: FieldPreviews;
  skills: Skill[];
  open: boolean;
  initialCommand?: CommandId;
  onOpenChange: (open: boolean) => void;
  onApply: (command: CommandId, preview: Preview) => void;
  onOpenSkill: (name: string) => void;
}) {
  const [picked, setPicked] = useState<CommandId | null>(null);
  const active = picked ?? initialCommand ?? null;
  const command = COMMANDS.find((c) => c.id === active);
  const preview = active ? previews[active] : undefined;

  const ready = COMMANDS.filter((c) => previews[c.id]);
  const locked = COMMANDS.filter((c) => !previews[c.id]);

  function close() {
    setPicked(null);
    onOpenChange(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (!o) setPicked(null);
        onOpenChange(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button id={`commands-${field}`} variant="outline" size="xs" aria-label={`Commands for ${FIELD_LABELS[field]}`}>
          <span className="font-mono">/</span> Commands
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,26rem)] p-0">
        {command && preview ? (
          <PreviewView
            field={field}
            command={command}
            before={text}
            preview={preview}
            onBack={() => setPicked(null)}
            onApply={() => {
              onApply(command.id, preview);
              close();
            }}
          />
        ) : (
          <Command loop>
            <CommandInput placeholder={`Command for ${FIELD_LABELS[field].toLowerCase()}…`} />
            <CommandList className="max-h-80">
              <CommandEmpty>No matching command or skill.</CommandEmpty>
              <CommandGroup heading="Commands">
                {ready.map((c) => (
                  <CommandItem key={c.id} value={`${c.label} ${c.description}`} onSelect={() => setPicked(c.id)}>
                    <CommandRow label={c.label} description={c.description} />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Needs a key">
                {locked.map((c) => (
                  <CommandItem key={c.id} value={`${c.label} ${c.description}`} disabled>
                    <CommandRow label={c.label} description={c.description} />
                    <HugeiconsIcon icon={Key01Icon} strokeWidth={1.8} className="ml-auto" />
                  </CommandItem>
                ))}
              </CommandGroup>
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

function CommandRow({ label, description, mono }: { label: string; description: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={mono ? "font-mono text-[13px]" : "font-medium"}>{label}</span>
      <span className="truncate text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

function PreviewView({
  field,
  command,
  before,
  preview,
  onBack,
  onApply,
}: {
  field: Field;
  command: EngineCommand;
  before: string;
  preview: Preview;
  onBack: () => void;
  onApply: () => void;
}) {
  return (
    <div
      className="flex max-h-[70vh] flex-col"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onApply();
        }
      }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon-xs" onClick={onBack} aria-label="Back to commands">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.8} />
        </Button>
        <span className="font-medium">{command.label}</span>
        <span className="text-xs text-muted-foreground">· {FIELD_LABELS[field]}</span>
      </div>
      <div className="space-y-3 overflow-y-auto p-3 text-sm">
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Now</span>
            <CharCount count={before.length} limit={LIMITS[field]} />
          </div>
          <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">{before}</p>
        </div>
        <div className="border-l-2 border-foreground pl-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium">Preview</span>
            <CharCount count={preview.text.length} limit={LIMITS[field]} />
          </div>
          <p className="whitespace-pre-wrap">{preview.text}</p>
        </div>
        {preview.notes.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {preview.notes.map((n) => (
              <li key={n.term}>
                <span className="font-semibold text-foreground">{n.term}</span> — {n.why}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t p-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button size="sm" onClick={onApply} autoFocus>
          Apply
        </Button>
      </div>
    </div>
  );
}
