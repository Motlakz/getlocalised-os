import { readFileSync } from "node:fs";
import path from "node:path";

import { Landing } from "@/components/landing/landing";
import { appDir, loadListing, loadMarket } from "@/lib/examples";
import { HERO_EXAMPLE } from "@/lib/site";

/** Static at build: the hero replays the committed BellyClock → German seed. */
export default function Home() {
  const listing = loadListing(HERO_EXAMPLE.app);
  const market = loadMarket(HERO_EXAMPLE.app, HERO_EXAMPLE.market);
  if (!market?.native || !market.generatedWith) throw new Error("The hero example has no seeded native listing.");

  const skillExcerpt = readFileSync(path.join(appDir(HERO_EXAMPLE.app), "skills", "brand.md"), "utf8").trim();

  return (
    <Landing
      skillExcerpt={skillExcerpt}
      hero={{
        name: listing.name,
        appId: listing.appId,
        category: listing.category,
        market: HERO_EXAMPLE.market,
        source: listing.fields,
        native: market.native.fields,
        notes: market.native.notes,
        phrases: market.phrases.items,
        model: market.generatedWith.model,
      }}
    />
  );
}
