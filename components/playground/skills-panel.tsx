"use client";

import { Markdown } from "@/components/markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Skill } from "@/lib/engine/types";

import { SectionLabel } from "./section-label";

/** Bottom right: the app's skill files, read-only. These are what shape every result. */
export function SkillsPanel({
  skills,
  value,
  onValueChange,
}: {
  skills: Skill[];
  value: string;
  onValueChange: (name: string) => void;
}) {
  return (
    <div id="skills" className="p-4 md:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <SectionLabel>Skills</SectionLabel>
        <span className="text-xs text-muted-foreground">read-only · shape every result</span>
      </div>
      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList className="w-full">
          {skills.map((s) => (
            <TabsTrigger key={s.name} value={s.name} className="font-mono text-xs">
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {skills.map((s) => (
          <TabsContent key={s.name} value={s.name} className="mt-3">
            <p className="mb-2 text-xs text-muted-foreground">{s.description}</p>
            <div className="max-h-[22rem] overflow-y-auto border bg-background p-3">
              <Markdown source={s.body} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
