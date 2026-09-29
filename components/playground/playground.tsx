"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { FIELDS, MARKET_INFO, type Fields } from "@/lib/engine/types";
import { analyze } from "@/lib/findings";
import type { PlaygroundData } from "@/lib/playground-data";

import { FieldRow } from "./field-row";
import { FindingsPanel } from "./findings-panel";
import { PhrasesPanel } from "./phrases-panel";
import { SectionLabel } from "./section-label";
import { TopBar } from "./top-bar";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function Playground({ data }: { data: PlaygroundData }) {
  const info = MARKET_INFO[data.market];
  const [fields, setFields] = useState<Fields>(data.native.fields);

  const findings = useMemo(
    () => analyze(fields, data.phrases.items, info.lang, [data.name]),
    [fields, data.phrases.items, info.lang, data.name],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar appName={data.name} market={data.market} right={<Badge variant="outline">Seeded mode</Badge>} />

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 border-x-0 lg:border-r">
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
              value={fields[field]}
              language={data.market}
              onChange={(value) => setFields((f) => ({ ...f, [field]: value }))}
            />
          ))}

          <div className="border-t">
            <FindingsPanel findings={findings} notes={data.native.notes} />
          </div>
        </main>

        <aside className="border-t bg-card lg:border-t-0">
          <div className="p-4 md:p-5">
            <SectionLabel className="mb-3">This run</SectionLabel>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">App</dt>
              <dd>
                {data.name} <span className="font-mono text-xs text-muted-foreground">{data.appId}</span>
              </dd>
              <dt className="text-muted-foreground">Category</dt>
              <dd>{data.category}</dd>
              <dt className="text-muted-foreground">Source</dt>
              <dd>English Play listing, {formatDate(data.sourceCapturedAt)}</dd>
              <dt className="text-muted-foreground">Market</dt>
              <dd>
                {info.language} · {info.country}
              </dd>
              <dt className="text-muted-foreground">Skills</dt>
              <dd>{data.skills.map((s) => s.name).join(", ")}</dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
