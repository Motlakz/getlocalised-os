"use client";

import { useMemo, useReducer, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { getCommand, type CommandId } from "@/lib/engine/commands";
import { FIELDS, MARKET_INFO, type Field, type Note } from "@/lib/engine/types";
import { analyze } from "@/lib/findings";
import type { PlaygroundData } from "@/lib/playground-data";

import { CommandMenu, type FieldPreviews } from "./command-menu";
import { CommandsRail } from "./commands-rail";
import { FieldRow } from "./field-row";
import { FindingsPanel } from "./findings-panel";
import { PhrasesPanel } from "./phrases-panel";
import { SectionLabel } from "./section-label";
import { SkillsPanel } from "./skills-panel";
import { initialState, playgroundReducer } from "./state";
import { TopBar } from "./top-bar";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

type MenuState = { field: Field; command?: CommandId } | null;

export function Playground({ data }: { data: PlaygroundData }) {
  const info = MARKET_INFO[data.market];
  const [state, dispatch] = useReducer(playgroundReducer, data.native.fields, initialState);
  const [menu, setMenu] = useState<MenuState>(null);
  const [activeField, setActiveField] = useState<Field>("title");
  const [skill, setSkill] = useState(data.skills[0]?.name ?? "");

  const findings = useMemo(
    () => analyze(state.fields, data.phrases.items, info.lang, [data.name]),
    [state.fields, data.phrases.items, info.lang, data.name],
  );

  /** Base notes plus the notes of each applied preview, one per term. */
  const notes = useMemo(() => {
    const all: Note[] = [...data.native.notes, ...FIELDS.flatMap((f) => state.notes[f] ?? [])];
    return [...new Map(all.map((n) => [n.term.toLowerCase(), n])).values()];
  }, [data.native.notes, state.notes]);

  /** Seeded previews for one field, keyed by command. */
  const previewsFor = (field: Field): FieldPreviews =>
    Object.fromEntries(
      Object.entries(data.commands).flatMap(([id, byField]) => (byField[field] ? [[id, byField[field]]] : [])),
    );

  function openMenu(field: Field, command?: CommandId) {
    setActiveField(field);
    document.getElementById(`commands-${field}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setMenu({ field, command });
  }

  function openSkill(name: string) {
    setSkill(name);
    document.getElementById("skills")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar appName={data.name} market={data.market} right={<Badge variant="outline">Seeded mode</Badge>} />

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 lg:border-r">
          <PhrasesPanel phrases={findings.phrases} source={data.phrases.source} capturedAt={data.phrases.capturedAt} country={info.country} />

          <div className="flex flex-wrap items-end justify-between gap-3 border-t px-4 py-4 md:px-5">
            <div>
              <SectionLabel>Native listing</SectionLabel>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">
                {data.name} in {info.language}
              </h1>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>
                Generated with <span className="font-mono text-foreground">{data.generatedWith.model}</span> ·{" "}
                {formatDate(data.generatedWith.at)}
              </p>
              <p className="mt-0.5">Wording comes from the model plus this app&apos;s skills, not measured search volume.</p>
            </div>
          </div>

          {FIELDS.map((field) => (
            <FieldRow
              key={field}
              field={field}
              source={data.source[field]}
              value={state.fields[field]}
              language={data.market}
              applied={state.applied[field] && getCommand(state.applied[field])?.label}
              onChange={(text) => dispatch({ type: "edit", field, text })}
              onSlash={() => openMenu(field)}
              onFocus={() => setActiveField(field)}
              actions={
                <CommandMenu
                  key={`${field}-${menu?.field === field ? (menu.command ?? "list") : "closed"}`}
                  field={field}
                  text={state.fields[field]}
                  previews={previewsFor(field)}
                  skills={data.skills}
                  open={menu?.field === field}
                  initialCommand={menu?.field === field ? menu.command : undefined}
                  onOpenChange={(open) => setMenu(open ? { field } : null)}
                  onApply={(command, preview) =>
                    dispatch({ type: "apply", field, command, text: preview.text, notes: preview.notes })
                  }
                  onOpenSkill={openSkill}
                />
              }
            />
          ))}

          <div className="border-t">
            <FindingsPanel findings={findings} notes={notes} />
          </div>
        </main>

        <aside className="border-t bg-card lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-t-0">
          <CommandsRail
            activeField={activeField}
            isReady={(id) => Boolean(data.commands[id]?.[activeField])}
            onRun={(id) => openMenu(activeField, id)}
          />
          <div className="border-t">
            <SkillsPanel skills={data.skills} value={skill} onValueChange={setSkill} />
          </div>
        </aside>
      </div>
    </div>
  );
}
