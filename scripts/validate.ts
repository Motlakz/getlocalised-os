/**
 * Checks every example app × market seed file is complete and valid.
 *
 *   bun run validate
 */
import { FIELDS, LIMITS, MARKETS, SEEDED_COMMANDS } from "../lib/engine";
import { EXAMPLE_APPS, loadListing, loadMarket, loadSkills } from "../lib/examples";

const problems: string[] = [];
let checked = 0;

for (const { app } of EXAMPLE_APPS) {
  try {
    loadListing(app);
  } catch (err) {
    problems.push(`${app}: listing.json missing or invalid (${(err as Error).message.split("\n")[0]})`);
    continue;
  }
  if (loadSkills(app).length === 0) problems.push(`${app}: no skills`);

  for (const market of MARKETS) {
    const where = `${app} ${market}`;
    let file;
    try {
      file = loadMarket(app, market);
    } catch (err) {
      problems.push(`${where}: invalid (${(err as Error).message.split("\n")[0]})`);
      continue;
    }
    if (!file) {
      problems.push(`${where}: missing`);
      continue;
    }
    checked++;
    if (file.phrases.items.length < 5) problems.push(`${where}: only ${file.phrases.items.length} phrases`);
    if (!file.generatedWith) problems.push(`${where}: no generatedWith`);
    if (!file.native) {
      problems.push(`${where}: no native listing`);
      continue;
    }
    for (const f of FIELDS)
      if (file.native.fields[f].length > LIMITS[f]) problems.push(`${where}: native ${f} over limit (${file.native.fields[f].length})`);
    for (const c of SEEDED_COMMANDS)
      for (const f of FIELDS) if (!file.commands[c.id]?.[f]) problems.push(`${where}: missing ${c.id} · ${f}`);
  }
}

if (problems.length) {
  console.error(`✖ ${problems.length} problem(s) across ${checked} seed files:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`✓ ${checked} seed files complete: native listing, ≥5 phrases, generatedWith, ${SEEDED_COMMANDS.length} commands × 3 fields each.`);
