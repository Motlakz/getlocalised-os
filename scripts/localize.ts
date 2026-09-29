/**
 * The local run: the same engine the Playground uses, with your own key.
 *
 *   bun run localize --app bellyclock --to de-DE
 *   bun run localize --app bellyclock --to de-DE --command punchier --field title
 *   bun run localize --listing my-listing.json --to fr-FR      # { "title", "short", "full" }
 *   bun run localize --seed [--app …] [--to …] [--force]      # writes data/examples (author)
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

import {
  FIELD_LABELS,
  FIELDS,
  FieldsSchema,
  getCommand,
  LIMITS,
  localizeListing,
  createProvider,
  rewriteField,
  type Field,
  type Fields,
  type LocalizeOutput,
  type ProviderId,
  type Skill,
} from "../lib/engine";
import { loadDefaultSkills, loadListing, loadMarket, loadSkills, marketPath } from "../lib/examples";
import { fail, pickApps, pickMarkets, requireKey, sleep, withBackoff, writeJson } from "./shared";

const { values } = parseArgs({
  options: {
    app: { type: "string" },
    listing: { type: "string" },
    to: { type: "string" },
    command: { type: "string" },
    field: { type: "string" },
    instruction: { type: "string" },
    provider: { type: "string", default: "gemini" },
    model: { type: "string" },
    seed: { type: "boolean" },
    force: { type: "boolean" },
  },
});

const providerId = values.provider as ProviderId;
if (providerId !== "gemini" && providerId !== "openai") fail(`Unknown provider "${values.provider}". Use gemini or openai.`);
const provider = createProvider(providerId, requireKey(providerId), values.model);

const PACE_MS = 4000;

function printListing(title: string, out: LocalizeOutput) {
  console.log(`\n━━ ${title} ━━`);
  for (const f of FIELDS) {
    const text = out.fields[f];
    const flag = text.length > LIMITS[f] ? "  ⚠ over limit" : "";
    console.log(`\n${FIELD_LABELS[f]}  (${text.length}/${LIMITS[f]})${flag}\n${text}`);
  }
  console.log("\nWhy these terms:");
  for (const n of out.notes) console.log(`  • ${n.term}: ${n.why}`);
}

async function runSeed() {
  const generatedWith = { provider: provider.id, model: provider.model, at: new Date().toISOString() };
  for (const app of pickApps(values.app)) {
    const listing = loadListing(app);
    const skills = loadSkills(app);
    for (const market of pickMarkets(values.to)) {
      const file = loadMarket(app, market);
      if (!file) fail(`No ${market}.json for ${app}. Run \`bun run capture --app ${app}\` first.`);
      if (file.native && !values.force) {
        console.log(`${app} ${market}: native listing exists, skipping`);
        continue;
      }
      console.log(`${app} ${market}: generating native listing…`);
      const native = await withBackoff(`${app} ${market}`, () =>
        localizeListing({ source: listing.fields, market, skills, phrases: file.phrases.items, provider }),
      );
      writeJson(marketPath(app, market), { ...file, native, generatedWith });
      await sleep(PACE_MS);
    }
  }
}

async function runOnce() {
  const [market, ...rest] = pickMarkets(values.to ?? "de-DE");
  if (rest.length) fail("Pass a single market with --to for a local run (use --seed for several).");

  let source: Fields;
  let skills: Skill[];
  let phrases: string[] = [];
  let native: Fields | undefined;
  if (values.listing) {
    source = FieldsSchema.parse(JSON.parse(readFileSync(values.listing, "utf8")));
    skills = loadDefaultSkills();
  } else {
    const [app] = pickApps(values.app ?? "bellyclock");
    source = loadListing(app).fields;
    skills = loadSkills(app);
    const file = loadMarket(app, market);
    phrases = file?.phrases.items ?? [];
    native = file?.native?.fields;
  }

  if (!values.command) {
    const out = await withBackoff(market, () => localizeListing({ source, market, skills, phrases, provider }));
    printListing(`${market} · ${provider.id} ${provider.model}`, out);
    return;
  }

  const command = getCommand(values.command);
  if (!command) fail(`Unknown command "${values.command}".`);
  const field = (values.field ?? "title") as Field;
  if (!FIELDS.includes(field)) fail(`--field must be one of ${FIELDS.join(", ")}.`);
  const text =
    native?.[field] ?? (await withBackoff(market, () => localizeListing({ source, market, skills, phrases, provider }))).fields[field];
  const previews = await withBackoff(command.id, () =>
    rewriteField({
      field,
      text,
      sourceText: source[field],
      market,
      skills,
      phrases,
      command,
      freeText: values.instruction,
      provider,
    }),
  );
  console.log(`\n━━ ${command.label} · ${FIELD_LABELS[field]} · ${market} ━━\n\nBefore (${text.length}/${LIMITS[field]}):\n${text}`);
  previews.forEach((p, i) => {
    console.log(`\nPreview ${i + 1} (${p.text.length}/${LIMITS[field]}):\n${p.text}`);
    for (const n of p.notes) console.log(`  • ${n.term}: ${n.why}`);
  });
}

try {
  await (values.seed ? runSeed() : runOnce());
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
