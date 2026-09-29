/**
 * Build-time capture, run by the author, never by the deployed app:
 * 1. the real English Play listing of each example app;
 * 2. per market, real Google Play search suggestions for terms Gemini proposes.
 *
 *   bun run capture [--app bellyclock] [--to de-DE,fr-FR] [--skip-listing]
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import gplay from "google-play-scraper";
import { z } from "zod";

import { createProvider, MARKET_INFO, type ListingFile, type Market, type MarketFile } from "../lib/engine";
import { appDir, EXAMPLE_APPS, listingPath, loadListing, loadMarket, loadSkills, marketPath } from "../lib/examples";
import { fail, pickApps, pickMarkets, requireKey, sleep, withBackoff, writeJson } from "./shared";

const { values } = parseArgs({
  options: { app: { type: "string" }, to: { type: "string" }, "skip-listing": { type: "boolean" } },
});

const MAX_PHRASES = 12;
const provider = createProvider("gemini", requireKey("gemini"));

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

async function captureListing(app: string, appId: string) {
  const a = await gplay.app({ appId, lang: "en", country: "us" });
  const skillsDir = path.join(appDir(app), "skills");
  const listing: ListingFile = {
    app,
    appId,
    name: decodeEntities(a.title).split(/[:\-–]/)[0].trim(),
    category: a.genre,
    sourceLocale: "en-US",
    fields: {
      title: decodeEntities(a.title),
      short: decodeEntities(a.summary),
      full: decodeEntities(a.description).trim(),
    },
    capturedAt: new Date().toISOString(),
    skills: existsSync(skillsDir) ? readdirSync(skillsDir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")) : [],
  };
  writeJson(listingPath(app), listing);
  console.log(`  listing: "${listing.fields.title}" (${listing.category})`);
}

const SeedTerms = z.object({ terms: z.array(z.string()).min(3).max(8) });

async function capturePhrases(app: string, market: Market) {
  const listing = loadListing(app);
  const skills = loadSkills(app);
  const { language, country, lang, gl } = MARKET_INFO[market];

  const { terms } = await withBackoff(`${app} ${market} seed terms`, () =>
    provider.generateJson({
      system: `You know how people in ${country} search the Google Play Store in ${language}.`,
      user: `App: ${listing.fields.title}\nCategory: ${listing.category}\nWhat it does: ${listing.fields.short}\n\nBrand notes:\n${skills
        .map((s) => s.body)
        .join("\n")}\n\nList 5 short search terms (1 to 3 words, lowercase, in ${language}) that people in ${country} would type into Google Play to find an app like this. Use the words locals really use, not literal translations of the English.`,
      schema: SeedTerms,
    }),
  );

  const seen = new Set<string>();
  const items: string[] = [];
  for (const term of terms) {
    const suggestions = await gplay.suggest({ term, lang, country: gl }).catch(() => [] as string[]);
    for (const s of suggestions) {
      const key = s.toLocaleLowerCase(lang).trim();
      if (!seen.has(key) && items.length < MAX_PHRASES) {
        seen.add(key);
        items.push(s.trim());
      }
    }
    await sleep(1200);
  }
  if (items.length === 0) fail(`No Play suggestions came back for ${app} ${market}. Try again later.`);

  const existing = loadMarket(app, market);
  const file: MarketFile = {
    market,
    ...existing,
    commands: existing?.commands ?? {},
    phrases: { items, source: "Google Play search suggestions", capturedAt: new Date().toISOString() },
  };
  writeJson(marketPath(app, market), file);
  console.log(`  ${market}: ${items.length} phrases (seed terms: ${terms.join(", ")})`);
}

try {
  for (const app of pickApps(values.app)) {
    const { appId } = EXAMPLE_APPS.find((a) => a.app === app)!;
    console.log(`\n${app} (${appId})`);
    if (!values["skip-listing"] || !existsSync(listingPath(app))) await captureListing(app, appId);
    for (const market of pickMarkets(values.to)) await capturePhrases(app, market);
  }
  console.log("\nDone.");
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
