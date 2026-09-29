import { existsSync } from "node:fs";

import { MARKETS, type Fields, type GeneratedWith, type Market, type MarketFile, type Note, type Skill } from "./engine/types";
import { EXAMPLE_APPS, listingPath, loadDefaultSkills, loadListing, loadMarket, loadSkills, marketPath } from "./examples";

/** Everything the Playground client needs for one app × market, read from the repo at build time. */
export type PlaygroundData = {
  app: string;
  name: string;
  appId: string;
  category: string;
  market: Market;
  source: Fields;
  sourceCapturedAt: string;
  native: { fields: Fields; notes: Note[] };
  phrases: MarketFile["phrases"];
  commands: MarketFile["commands"];
  generatedWith: GeneratedWith;
  skills: Skill[];
  /** Generic skills for "paste your own listing" (bundled at build, so the route never reads files). */
  defaultSkills: Skill[];
  /** Which app × market pairs have seeded data, for the pickers. */
  available: { app: string; name: string; markets: Market[] }[];
};

function seeded(app: string, market: Market): boolean {
  if (!existsSync(listingPath(app)) || !existsSync(marketPath(app, market))) return false;
  const file = loadMarket(app, market);
  return Boolean(file?.native && file.generatedWith);
}

export function availableExamples(): PlaygroundData["available"] {
  return EXAMPLE_APPS.flatMap(({ app }) => {
    const markets = MARKETS.filter((m) => seeded(app, m));
    return markets.length ? [{ app, name: loadListing(app).name, markets }] : [];
  });
}

export function loadPlaygroundData(app: string, market: Market): PlaygroundData | undefined {
  if (!seeded(app, market)) return undefined;
  const listing = loadListing(app);
  const file = loadMarket(app, market)!;
  return {
    app,
    name: listing.name,
    appId: listing.appId,
    category: listing.category,
    market,
    source: listing.fields,
    sourceCapturedAt: listing.capturedAt,
    native: file.native!,
    phrases: file.phrases,
    commands: file.commands,
    generatedWith: file.generatedWith!,
    skills: loadSkills(app),
    defaultSkills: loadDefaultSkills(),
    available: availableExamples(),
  };
}
