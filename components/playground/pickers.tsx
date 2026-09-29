"use client";

import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MARKET_INFO, type Market } from "@/lib/engine/types";
import type { PlaygroundData } from "@/lib/playground-data";
import { cn } from "@/lib/utils";

type Option = { href: string; label: string; hint?: string; active: boolean };

function Picker({ label, value, options }: { label: string; value: React.ReactNode; options: Option[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={label} className="gap-1.5 px-2 text-sm">
          {value}
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.8} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-1">
        <p className="px-2 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
        {options.map((o) => (
          <Link
            key={o.href}
            href={o.href}
            onClick={() => setOpen(false)}
            className={cn("flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted", o.active && "font-medium")}
          >
            <span className="flex-1">{o.label}</span>
            {o.hint && <span className="font-mono text-xs text-muted-foreground">{o.hint}</span>}
            {o.active && <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3.5" />}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** App → market pickers. Each choice is its own static page, so switching resets edits. */
export function Pickers({ data }: { data: PlaygroundData }) {
  const markets = data.available.find((a) => a.app === data.app)?.markets ?? [data.market];
  const href = (app: string, market: Market) => `/playground/${app}/${market}`;
  return (
    <div className="flex items-center gap-0.5">
      <Picker
        label="Example app"
        value={<span className="font-medium">{data.name}</span>}
        options={data.available.map((a) => ({
          href: href(a.app, a.markets.includes(data.market) ? data.market : a.markets[0]),
          label: a.name,
          active: a.app === data.app,
        }))}
      />
      <span className="text-muted-foreground">→</span>
      <Picker
        label="Market"
        value={
          <>
            <span className="font-mono">{data.market}</span>
            <span className="hidden text-muted-foreground sm:inline">{MARKET_INFO[data.market].language}</span>
          </>
        }
        options={markets.map((m) => ({
          href: href(data.app, m),
          label: MARKET_INFO[m].language,
          hint: m,
          active: m === data.market,
        }))}
      />
    </div>
  );
}
