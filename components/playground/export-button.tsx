"use client";

import { Download04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { MARKET_INFO, type Fields, type GeneratedWith, type Market } from "@/lib/engine/types";

/** Downloads the current native listing (with any applied edits) as JSON. */
export function ExportButton({
  app,
  appId,
  market,
  fields,
  generatedWith,
}: {
  app: string;
  appId: string;
  market: Market;
  fields: Fields;
  generatedWith: GeneratedWith;
}) {
  function download() {
    const body = {
      appId,
      market,
      language: MARKET_INFO[market].language,
      fields,
      generatedWith,
      exportedAt: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${app}-${market}.json` });
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="outline" size="sm" onClick={download}>
      <HugeiconsIcon icon={Download04Icon} strokeWidth={1.8} />
      Export
    </Button>
  );
}
