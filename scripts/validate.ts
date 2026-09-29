/**
 * Checks every example app × market seed file is complete and valid.
 *
 *   bun run validate
 *   bun run validate --fix    # drops notes that claim demand, the same rule the engine applies
 */
import { FIELDS, hasDemandClaim, LIMITS, MARKETS, SEEDED_COMMANDS, type MarketFile, type Note } from "../lib/engine";
import { EXAMPLE_APPS, loadListing, loadMarket, loadSkills, marketPath } from "../lib/examples";
import { writeJson } from "./shared";

const FIX = process.argv.includes("--fix");
const keep = (notes: Note[]) => notes.filter((n) => !hasDemandClaim(n.why));

function dropClaims(file: MarketFile): MarketFile {
  return {
    ...file,
    native: file.native && { ...file.native, notes: keep(file.native.notes) },
    commands: Object.fromEntries(
      Object.entries(file.commands).map(([id, byField]) => [
        id,
        Object.fromEntries(Object.entries(byField).map(([f, p]) => [f, p && { ...p, notes: keep(p.notes) }])),
      ]),
    ),
  };
}

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
    if (FIX) {
      file = dropClaims(file);
      writeJson(marketPath(app, market), file);
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
    const notes = [
      ...file.native.notes,
      ...Object.values(file.commands).flatMap((byField) => Object.values(byField).flatMap((p) => p?.notes ?? [])),
    ];
    for (const n of notes) if (hasDemandClaim(n.why)) problems.push(`${where}: note on "${n.term}" claims demand it can't back up`);
  }
}

if (problems.length) {
  console.error(`✖ ${problems.length} problem(s) across ${checked} seed files:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`✓ ${checked} seed files complete: native listing, ≥5 phrases, generatedWith, ${SEEDED_COMMANDS.length} commands × 3 fields each.`);
