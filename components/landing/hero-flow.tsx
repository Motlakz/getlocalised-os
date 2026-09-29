"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { FIELD_LABELS, LIMITS, MARKET_INFO, type Fields, type Market, type Note } from "@/lib/engine/types";
import { analyze } from "@/lib/findings";
import { cn } from "@/lib/utils";

export type HeroFlowData = {
  name: string;
  appId: string;
  category: string;
  market: Market;
  source: Fields;
  native: Fields;
  notes: Note[];
  phrases: string[];
  model: string;
};

const SCENES = ["Pick an app", "Choose a market", "Write it natively", "Check it"] as const;
const SCENE_MS = 3400;
const ease = [0.22, 1, 0.36, 1] as const;

/** The landing hero: one real seeded run (BellyClock → German) replayed as four timed scenes. */
export function HeroFlow({ data }: { data: HeroFlowData }) {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoplay = !reduce && !paused;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS);
    return () => clearTimeout(t);
  }, [scene, autoplay]);

  const info = MARKET_INFO[data.market];
  const findings = analyze(data.native, data.phrases, info.lang, [data.name]);
  const used = findings.phrases.filter((p) => p.status === "exact");

  return (
    <div
      className="border border-mk-line bg-mk-raised"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Window chrome + scene steps */}
      <div className="flex items-center gap-3 border-b border-mk-line px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 border border-mk-line" />
          ))}
        </span>
        <span className="font-mono text-[11px] text-mk-subtle">
          playground / {data.name.toLowerCase()} / {data.market}
        </span>
        <span className="ml-auto font-mono text-[10px] text-mk-subtle uppercase">replay of a real run</span>
      </div>
      <div className="grid grid-cols-4 border-b border-mk-line" role="tablist" aria-label="Flow steps">
        {SCENES.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={scene === i}
            onClick={() => setScene(i)}
            className={cn(
              "relative overflow-hidden px-2 py-2 text-left not-last:border-r not-last:border-mk-line",
              scene === i ? "text-mk-fg" : "text-mk-subtle hover:text-mk-fg",
            )}
          >
            {scene === i && autoplay && (
              <motion.span
                key={`bar-${scene}`}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left bg-mk-fg"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SCENE_MS / 1000, ease: "linear" }}
              />
            )}
            {scene === i && !autoplay && <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-mk-fg" />}
            <span className="block font-mono text-[10px]">0{i + 1}</span>
            <span className="block truncate text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="relative h-[21rem] overflow-hidden p-4 sm:h-[19rem] sm:p-5" role="tabpanel" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease }}
            className="h-full"
          >
            {scene === 0 && <AppScene data={data} />}
            {scene === 1 && <MarketScene data={data} language={info.language} />}
            {scene === 2 && <NativeScene data={data} />}
            {scene === 3 && <CheckScene data={data} used={used.map((p) => p.phrase)} total={data.phrases.length} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[10px] tracking-[0.14em] text-mk-subtle uppercase">{children}</p>
);

function AppScene({ data }: { data: HeroFlowData }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center bg-mk-fg font-heading text-lg font-black text-mk-bg">B</span>
        <div>
          <p className="font-heading font-bold">{data.name}</p>
          <p className="font-mono text-xs text-mk-subtle">
            {data.appId} · {data.category}
          </p>
        </div>
      </div>
      <div className="space-y-3 border-t border-mk-line pt-4">
        <Label>English source · Google Play</Label>
        <p className="font-heading text-lg font-semibold">{data.source.title}</p>
        <p className="text-sm text-mk-muted">{data.source.short}</p>
        <p className="line-clamp-3 text-sm text-mk-subtle">{data.source.full}</p>
      </div>
    </div>
  );
}

function MarketScene({ data, language }: { data: HeroFlowData; language: string }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="border border-mk-line px-2 py-1 text-mk-subtle">en-US</span>
        <motion.span initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 0.5, ease }} className="h-px bg-mk-fg" />
        <span className="bg-mk-fg px-2 py-1 text-mk-bg">{data.market}</span>
        <span className="text-mk-subtle">{language}</span>
      </div>
      <div>
        <Label>What people search on Google Play</Label>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {data.phrases.slice(0, 9).map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.3, ease }}
              className="border border-mk-line px-2 py-1 text-[13px]"
            >
              {p}
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="mt-auto text-xs text-mk-subtle">Real Play search suggestions, captured once and dated.</p>
    </div>
  );
}

function Typed({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.06, duration: 0.2 }}
        >
          {w}{" "}
        </motion.span>
      ))}
    </p>
  );
}

function NativeScene({ data }: { data: HeroFlowData }) {
  return (
    <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="hidden space-y-2 border-r border-mk-line pr-4 sm:block">
        <Label>en-US</Label>
        <p className="font-heading font-semibold text-mk-subtle">{data.source.title}</p>
        <p className="text-sm text-mk-subtle">{data.source.short}</p>
      </div>
      <div className="space-y-2">
        <Label>{data.market} · native</Label>
        <Typed text={data.native.title} className="font-heading text-lg font-semibold" />
        <Typed text={data.native.short} delay={0.5} className="text-sm" />
        <Typed text={data.native.full.split("\n")[0]} delay={1.1} className="line-clamp-3 text-sm text-mk-muted" />
      </div>
    </div>
  );
}

function CheckScene({ data, used, total }: { data: HeroFlowData; used: string[]; total: number }) {
  const counts = (["title", "short"] as const).map((f) => ({ f, n: data.native[f].length }));
  return (
    <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <Label>Checked against the store</Label>
        {counts.map(({ f, n }, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between border-b border-mk-line pb-1.5 text-sm"
          >
            <span>{FIELD_LABELS[f]}</span>
            <span className="font-mono text-xs">
              {n}/{LIMITS[f]} fits
            </span>
          </motion.div>
        ))}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm">
          <span className="font-mono">
            {used.length}/{total}
          </span>{" "}
          search phrases used naturally
        </motion.p>
        <div className="flex flex-wrap gap-1.5">
          {used.slice(0, 4).map((p) => (
            <span key={p} className="bg-mk-fg px-2 py-0.5 text-xs text-mk-bg">
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Why these terms</Label>
        {data.notes.slice(0, 2).map((n, i) => (
          <motion.p
            key={n.term}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25 }}
            className="text-sm"
          >
            <span className="font-semibold">{n.term}</span>
            <span className="text-mk-muted"> — {n.why}</span>
          </motion.p>
        ))}
        <p className="pt-1 font-mono text-[10px] text-mk-subtle">generated with {data.model}</p>
      </div>
    </div>
  );
}
