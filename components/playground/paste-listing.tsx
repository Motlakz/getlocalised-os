"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FIELD_LABELS, FIELDS, LIMITS, MARKET_INFO, MARKETS, type Fields, type LocalizeOutput, type Market, type Skill } from "@/lib/engine/types";
import { checkLimits, checkRepetition } from "@/lib/findings";
import { runLocalize, useLiveKey } from "@/lib/live-client";
import { cn } from "@/lib/utils";

import { CharCount } from "./char-count";
import { CopyButton } from "./copy-button";
import { SectionLabel } from "./section-label";

const EMPTY: Fields = { title: "", short: "", full: "" };

/** With a key: paste any English listing and get a native one, shaped by generic default skills. */
export function PasteListing({ market: initialMarket, skills }: { market: Market; skills: Skill[] }) {
  const live = useLiveKey();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Fields>(EMPTY);
  const [market, setMarket] = useState<Market>(initialMarket);
  const [state, setState] = useState<
    { status: "idle" } | { status: "running" } | { status: "done"; result: LocalizeOutput } | { status: "error"; message: string }
  >({ status: "idle" });

  const missing = FIELDS.filter((f) => !source[f].trim());

  async function generate() {
    if (!live || missing.length) return;
    setState({ status: "running" });
    try {
      const result = await runLocalize(live, { market, listing: source, skills });
      setState({ status: "done", result });
    } catch (err) {
      setState({ status: "error", message: (err as Error).message });
    }
  }

  const trigger = (
    <Button variant="ghost" size="sm" disabled={!live}>
      Paste your listing
    </Button>
  );

  if (!live)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>{trigger}</span>
        </TooltipTrigger>
        <TooltipContent>Add your key to localize your own listing</TooltipContent>
      </Tooltip>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Localize your own listing</DialogTitle>
          <DialogDescription>
            Paste your English Play listing. It runs live with your key, guided by generic default skills. Your own skill files come with the
            local run.
          </DialogDescription>
        </DialogHeader>

        {state.status !== "done" ? (
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <label key={f} className="block">
                <span className="mb-1 flex justify-between text-xs font-medium">
                  {FIELD_LABELS[f]}
                  <CharCount count={source[f].length} limit={LIMITS[f]} />
                </span>
                <textarea
                  value={source[f]}
                  onChange={(e) => setSource((s) => ({ ...s, [f]: e.target.value }))}
                  rows={f === "full" ? 7 : f === "short" ? 2 : 1}
                  className="w-full resize-y border bg-background p-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
                />
              </label>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Market</span>
              {MARKETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarket(m)}
                  className={cn("border px-2 py-1 font-mono text-xs", m === market ? "bg-foreground text-background" : "hover:bg-muted")}
                >
                  {m}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                {missing.length > 0 && `Add a ${FIELD_LABELS[missing[0]].toLowerCase()} to continue`}
              </span>
              <Button size="sm" onClick={generate} disabled={missing.length > 0 || state.status === "running"}>
                {state.status === "running" ? "Running…" : `Write it in ${MARKET_INFO[market].language}`}
              </Button>
            </div>
            {state.status === "error" && (
              <p className="border-l-2 border-danger pl-3 text-sm">
                <span className="font-mono text-[11px] font-semibold text-danger uppercase">Didn&apos;t run · </span>
                {state.message}
              </p>
            )}
          </div>
        ) : (
          <Result
            result={state.result}
            language={MARKET_INFO[market].lang}
            onBack={() => setState({ status: "idle" })}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Result({ result, language, onBack }: { result: LocalizeOutput; language: string; onBack: () => void }) {
  const over = checkLimits(result.fields).filter((l) => l.over);
  const repeats = checkRepetition(result.fields, language);
  return (
    <div className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f} className="border p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium">{FIELD_LABELS[f]}</span>
            <span className="flex items-center gap-1">
              <CharCount count={result.fields[f].length} limit={LIMITS[f]} />
              <CopyButton text={result.fields[f]} label={FIELD_LABELS[f]} />
            </span>
          </div>
          <p className="max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">{result.fields[f]}</p>
        </div>
      ))}
      <div>
        <SectionLabel className="mb-2">Findings</SectionLabel>
        <ul className="space-y-1 text-sm">
          {over.map((l) => (
            <li key={l.field}>
              {FIELD_LABELS[l.field]} is over its limit ({l.count}/{l.limit}).
            </li>
          ))}
          {repeats.map((r) => (
            <li key={`${r.word}-${r.where}`}>
              “{r.word}” appears {r.count} times. Consider rephrasing.
            </li>
          ))}
          {over.length + repeats.length === 0 && <li className="text-muted-foreground">Every field fits and no word is overused.</li>}
          {result.notes.map((n) => (
            <li key={n.term} className="text-muted-foreground">
              <span className="font-semibold text-foreground">{n.term}</span> — {n.why}
            </li>
          ))}
        </ul>
      </div>
      <Button variant="outline" size="sm" onClick={onBack}>
        Edit and run again
      </Button>
    </div>
  );
}
