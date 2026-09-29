"use client";

import { Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PROVIDER_NAMES, type ProviderId } from "@/lib/engine/providers/types";
import { setLiveKey, useLiveKey } from "@/lib/live-client";
import { cn } from "@/lib/utils";

const PROVIDERS: ProviderId[] = ["gemini", "openai"];

/** Top bar: seeded mode by default; paste a Gemini or OpenAI key to run everything live. */
export function KeyControl() {
  const live = useLiveKey();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<ProviderId>(live?.provider ?? "gemini");
  const [key, setKey] = useState("");

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setProvider(live?.provider ?? "gemini");
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className={cn("size-1.5", live ? "bg-foreground" : "border border-muted-foreground")} aria-hidden />
          {live ? `Live · ${PROVIDER_NAMES[live.provider]}` : "Seeded mode"}
          <HugeiconsIcon icon={Key01Icon} strokeWidth={1.8} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,22rem)]">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!key.trim()) return;
            setLiveKey({ provider, key: key.trim() });
            setKey("");
            setOpen(false);
          }}
        >
          <div>
            <p className="font-heading text-sm font-semibold">Run it live with your own key</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Without a key, the five prepared commands work. With one, every command, free-form instructions and your own listing run
              live.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px border bg-border" role="radiogroup" aria-label="Provider">
            {PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={provider === p}
                onClick={() => setProvider(p)}
                className={cn("py-1.5 text-sm", provider === p ? "bg-foreground text-background" : "bg-background hover:bg-muted")}
              >
                {PROVIDER_NAMES[p]}
              </button>
            ))}
          </div>
          <Input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={live ? `Replace your ${PROVIDER_NAMES[live.provider]} key` : `Paste your ${PROVIDER_NAMES[provider]} API key`}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            aria-label="API key"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your key is sent with each request to this app&apos;s own server, used once to call {PROVIDER_NAMES[provider]}, and never stored
            or logged. It stays in this browser tab only and is gone when you close it.
          </p>
          <div className="flex justify-end gap-2">
            {live && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLiveKey(null);
                  setOpen(false);
                }}
              >
                Remove key
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!key.trim()}>
              Use key
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
