import Link from "next/link";

import { MARKET_INFO, type Market } from "@/lib/engine/types";

export function TopBar({
  appName,
  market,
  right,
  pickers,
}: {
  appName: string;
  market: Market;
  right?: React.ReactNode;
  pickers?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-heading text-[15px] font-bold tracking-tight">GetLocalised</span>
          <span className="font-mono text-[11px] text-muted-foreground">OS</span>
        </Link>
        <span className="h-5 w-px bg-border" aria-hidden />
        <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">Playground</span>
        <div className="ml-2 flex min-w-0 items-center gap-2 text-sm">
          {pickers ?? (
            <>
              <span className="truncate font-medium">{appName}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-mono">{market}</span>
              <span className="hidden text-muted-foreground sm:inline">{MARKET_INFO[market].language}</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
