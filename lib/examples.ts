import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  ListingFileSchema,
  MarketFileSchema,
  type ListingFile,
  type Market,
  type MarketFile,
  type Skill,
} from "./engine/types";

export const EXAMPLE_APPS = [
  { app: "aurasage", appId: "com.aurasage" },
  { app: "bellyclock", appId: "com.bellyclock" },
  { app: "lovetestai", appId: "com.lovetestai" },
] as const;
export type ExampleAppId = (typeof EXAMPLE_APPS)[number]["app"];

export const DATA_DIR = path.join(process.cwd(), "data");
export const appDir = (app: string) => path.join(DATA_DIR, "examples", app);
export const listingPath = (app: string) => path.join(appDir(app), "listing.json");
export const marketPath = (app: string, market: Market) => path.join(appDir(app), `${market}.json`);

export function isExampleApp(app: string): app is ExampleAppId {
  return EXAMPLE_APPS.some((a) => a.app === app);
}

export function loadListing(app: string): ListingFile {
  return ListingFileSchema.parse(JSON.parse(readFileSync(listingPath(app), "utf8")));
}

export function loadMarket(app: string, market: Market): MarketFile | undefined {
  const file = marketPath(app, market);
  if (!existsSync(file)) return undefined;
  return MarketFileSchema.parse(JSON.parse(readFileSync(file, "utf8")));
}

/** Parses a SKILL.md-style file: `name` and `description` frontmatter, then the guidance. */
export function parseSkill(source: string, fallbackName: string): Skill {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { name: fallbackName, description: "", body: source };
  const meta = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
  );
  return { name: meta.name ?? fallbackName, description: meta.description ?? "", body: match[2] };
}

function loadSkillsFrom(dir: string): Skill[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => parseSkill(readFileSync(path.join(dir, f), "utf8"), f.replace(/\.md$/, "")));
}

export const loadSkills = (app: string) => loadSkillsFrom(path.join(appDir(app), "skills"));
export const loadDefaultSkills = () => loadSkillsFrom(path.join(DATA_DIR, "default-skills"));
