---
doc: spec
status: approved
---

# GetLocalised OS — Technical Spec

## How This Works, In Plain Language
GetLocalised OS is one Next.js app with two pages and one engine.

- **The engine** is a small set of TypeScript functions. You give it an English listing, a target market, the app's skill files, the market's search phrases, and a command. It asks a model (Gemini or OpenAI) for native text and a short note on why key terms were chosen, then checks the answer's shape before returning it.
- **The seeded data** is the engine's output, saved as JSON files in the repo. The author runs the engine once locally with their own Gemini key for 3 apps × 3 markets, and the results are committed. That's why the Playground works with no key: it reads those files. Every seeded result is real engine output, labelled with the model and date.
- **The findings** are plain checks that run in the browser on whatever text is on screen: which search phrases appear in which field, which words repeat too often, and which fields break Play's limits. No model is involved, so they update instantly when you apply a command.
- **The Playground** shows it all: pick an app and market, compare English and native side by side, read findings, and use the `/` menu. Paste a key and the page sends it, with the request, to this app's own server route, which calls the provider and discards the key.
- **The landing page** explains the project in a docs-style layout, with an animated hero that replays a real seeded run.

Why this shape: there's no database, no accounts, and no service except the user's chosen model provider. It's forkable in one `git clone`, and the same engine serves the seeded, live, and local runs, so the demo can't drift from what the code actually does.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The visitor opens `/`. The hero reads `data/examples/bellyclock/de-DE.json` and animates the steps: app → market → fields appear → findings.
2. **Open Playground** goes to `/playground?app=bellyclock&market=de-DE`.
3. The Playground loads `data/examples/bellyclock/listing.json` (English source, skills list) and `.../de-DE.json` (phrases, native listing, seeded command results). These files are bundled at build time, so there is no network call.
4. The compare view renders English left and native right. `lib/findings` runs on the native fields and the findings panel renders.
5. The visitor types `/` in the German title. The cmdk menu lists Commands (5 seeded, 5 live-only, free-form) and Skills. They pick **Punchier**; the preview comes straight from `de-DE.json → commands.punchier.title`. They pick the preview, the field text changes in page state, and findings re-run.
6. **Copy** puts the field on the clipboard. **Export** downloads `bellyclock-de-DE.json` (fields + market).
7. *With a key:* the visitor pastes a Gemini/OpenAI key, which is kept in `sessionStorage`. Picking **Simplify** sends `POST /api/rewrite` with the key in the `x-model-key` header. The route calls `lib/engine.rewriteField` → provider → zod-validated previews, and returns them. The key is never logged or stored.
8. *Local run:* a developer runs `bun run localize --app bellyclock --to de-DE`. The same `lib/engine` runs in Bun with `GEMINI_API_KEY` from `.env.local` and prints (or, with `--seed`, writes) the result.

## Stack
Chosen to match the author's existing GetLocalised stack (the same tools, with code written fresh here).

| Piece | Choice | Why | Docs |
|---|---|---|---|
| Framework | Next.js **16.3.6** (App Router), React 19.2 | Already scaffolded, and the author's daily stack. Read `node_modules/next/dist/docs/` before writing routes (AGENTS.md) | https://nextjs.org/docs |
| Runtime / package manager | Bun 1.3 | Already in use. It also runs the TypeScript scripts directly | https://bun.sh/docs |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix) | Matches the original app. Tokens live in `app/globals.css` | https://tailwindcss.com/docs · https://ui.shadcn.com/docs |
| Command palette | `cmdk` | The `/` menu, as in the original app | https://github.com/pacocoursey/cmdk |
| Motion | `motion` | Hero step transitions | https://motion.dev/docs/react |
| Validation | `zod` 4 | Model output shape, seed files, route input | https://zod.dev |
| Models | `@google/genai` (seed + live), `openai` (live) | Official SDKs, as in the original app | https://ai.google.dev/gemini-api/docs · https://platform.openai.com/docs |
| Play data (build time only) | `google-play-scraper` 10.1.3 | Read-only listing + search suggestions, run once by a script, never in the deployed app | https://github.com/facundoolano/google-play-scraper |
| Fonts | `next/font/google`: Raleway, Source Sans 3, Merriweather | The Slate typography | https://nextjs.org/docs/app/getting-started/fonts |

**To verify early in the build (not checked live while writing this):**
- The current Gemini and OpenAI model IDs and the JSON-schema output options in the installed SDK versions. The model ID is a single constant per provider so it's a one-line change. *Resolved in slice 1:* Gemini default is `gemini-3.5-flash-lite` (see checklist Revisions); OpenAI is checked in slice 5.
- `google-play-scraper` 10.1.3 `app()` and `suggest()` still work against Play today.
- Next 16 route handler conventions, from the bundled docs.

## Where It Runs and How Someone Tries It
- **Local:** `bun install` → `bun dev` → open `http://localhost:3000` (landing) and `http://localhost:3000/playground`. No key is needed.
- **Local run (engine):** copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (or `OPENAI_API_KEY`), then run `bun run localize --app bellyclock --to de-DE`. Add `--command punchier --field title` for one command, or `--provider openai`.
- **Regenerating seeds (author only):** `bun run capture` (listings + phrases, build time), then `bun run localize --seed`. Both are resumable.
- **Deployed (chosen):** a new Vercel project linked to the public GitHub repo, with the domain **`dev.getlocalised.com`** added in the project's domain settings. `getlocalised.com` is already on Vercel, so the subdomain is added there. If DNS isn't managed by Vercel, add a CNAME `dev → cname.vercel-dns.com`. **No environment variables are needed in production**, because live mode is BYOK only.
- **Demo recording:** landing hero → Open Playground → switch to de-DE → `/` Punchier on the title → apply → findings update → Skills panel → export. Optionally paste a key and run Simplify live.
- Submission still needs the demo video and the public repo. The deploy is additional, not a substitute.

## Look and Feel
Carries forward `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.
- **Palette:** the Slate structure in **pure greyscale**. Tokens are defined in `app/globals.css` under the original's role names (`ink`, `ink-raised`, `paper`, `mk-*`), but with neutral greys in place of green-cast ink and sage, and **no lime**. The one accent is high-contrast white-on-ink (dark) / ink-on-paper (light). Status colours (over-limit) are always paired with a text label.
- **Theme:** theme-aware tokens (light + dark). The landing page defaults to dark, like the original marketing site.
- **Type:** Raleway for headings, Source Sans 3 for body/UI, Merriweather for occasional editorial serif (e.g. hero subline), and a monospace stack for code, commands, and character counts.
- **Density:** the landing page is spacious and documentation-like: a sticky section nav on desktop, prose, and code blocks. The Playground is a denser working tool.
- **Motion:** the hero uses short, eased step transitions (fade/slide/typewriter reveal of fields) via `motion`, respecting `prefers-reduced-motion`.
- **Copy tone:** plain, developer-to-developer, with no hype.
- **Avoid:** lime or any brand colour, gradients or glows typical of AI apps, and any mention of another edition.

## Components

### Engine
`lib/engine/`. Implements `prd.md > Native Listing and Compare View`, `prd.md > Commands`, `prd.md > Local Run`.
- `localizeListing({ listing, market, skills, phrases, provider })` → `{ fields: { title, short, full }, notes: Note[] }`
- `rewriteField({ field, text, source, market, skills, phrases, command, freeText?, provider })` → `{ previews: { text, notes }[] }` (1 preview; 3 for *Variants*)
- `prompt.ts` builds the system and user prompt: role, the Play limits, the skill files verbatim, the market's phrases ("prefer natural use of these; never stuff"), the command instruction, and the JSON shape to return. Written fresh for this project.
- `providers/gemini.ts` and `providers/openai.ts` share one `generateJson(system, user, schema, key, model)` interface. Output is parsed with zod; an invalid shape gets one retry, then an error.
- It runs in both Bun (scripts) and the Next.js Node runtime (route). It has no browser-only or Next-only imports.

### Commands
`lib/engine/commands.ts`. Implements `prd.md > Commands`.
- There are 10 entries: `native`, `aso` (Search terms), `punchier`, `benefit`, `fit`, `shorter`, `simplify`, `formal`, `casual`, `variants`, plus `custom` (free-form). Each has `{ id, label, description, instruction, seeded }`.
- `seeded: true` for native, aso, punchier, benefit, fit. The names and one-line descriptions are adapted from the author's GetLocalised command palette (disclosed in the README), and the instructions are written fresh.

### Findings
`lib/findings/`. Implements `prd.md > Findings`. Pure functions, unit-tested, run client-side.
- `limits.ts`: title 30, short 80, full 4000 characters. Returns count, limit, and over/under.
- `phrases.ts`: for each market phrase, which fields contain it, case- and diacritic-insensitive, with whole-word matching.
- `repetition.ts`: counts content words across all fields, ignoring a small stopword list per language (en/fr/es/de), and flags words above a threshold (≥4 in full, ≥2 in title+short). Output: "'fasten' appears 5 times".
- `index.ts`: `analyze(fields, phrases, lang)` → findings list. *Why this term* notes come from the engine output, not from here.

### Seed Pipeline
`scripts/`. Implements `prd.md > Example Apps and Seeded Data`, `prd.md > Local Run`.
- `capture.ts` (`bun run capture`): for each app, it fetches the real English listing with `gplay.app({ appId, lang: 'en', country: 'us' })` and writes `listing.json`. Then, for each market, it asks Gemini for 4–6 local seed terms from the app's category and skills, and calls `gplay.suggest({ term, lang, country })` for each. It keeps the deduplicated real suggestions (up to ~12) and writes `phrases` with `source: "Google Play search suggestions"` and `capturedAt`. It pauses between calls.
- `localize.ts` (`bun run localize`): the local-run CLI (args: `--app`, `--to`, `--command`, `--field`, `--provider`, `--seed`). In `--seed` mode, for every app × market it writes the native listing, then every seeded command × field. It skips entries that already exist (resumable), paces itself for Gemini free-tier limits, and stamps `generatedWith: { provider, model, at }`.

### Rewrite and Localize Routes
`app/api/rewrite/route.ts`, `app/api/localize/route.ts`. Implements `prd.md > Bring Your Own Key (Playground)`.
- `POST`, Node runtime. The key comes from the `x-model-key` header, the provider from the body. The body is validated with zod.
- `rewrite` body: `{ provider, app?, listing?, market, field, text, command, freeText? }` → `{ previews }`.
- `localize` body: `{ provider, listing: { title, short, full }, market }` → `{ fields, notes }`. This is "paste your own listing". Empty fields are rejected with `bad_input` naming the field. It uses a generic default skill set (`data/default-skills/*.md`).
- Errors map to `{ error: { code: 'invalid_key' | 'quota' | 'bad_output' | 'bad_input', message } }` with plain wording ("The key was rejected by Gemini", "Out of credit or rate-limited"). There is no logging of headers or bodies, and the key never appears in a URL or response.

### Landing Page
`app/page.tsx` + `components/landing/`. Implements `prd.md > Landing Page`, `prd.md > Screens and Layout > Landing page`.
- `Hero`: headline, subline, **Open Playground** (primary) and **GitHub** (secondary) CTAs. `HeroFlow` is a `motion` stepper that replays BellyClock → de-DE from seed data (app card → market chip → fields typing in → two findings), then loops.
- Docs-style sections with a sticky side nav: *What it does* · *Skills and commands* · *Run it locally* (code blocks) · *Project boundaries* (what it doesn't do) · footer.

### Playground
`app/playground/page.tsx` (server: loads seed files) + `components/playground/` (client). Implements `prd.md > Screens and Layout > Playground`, `prd.md > States and Boundaries`.
- `TopBar`: `AppPicker`, `MarketPicker`, `KeyControl` (a popover with provider select + password input + "Used once per request, never stored" + clear; the badge reads *Seeded mode* / *Live · Gemini*).
- `PhrasesPanel`: chips, plus source and date.
- `CompareView` → `FieldRow` ×3: English text | native text (editable textarea), `CharCount`, copy button, `/` trigger. The header shows *Generated with {model} · {date}* (from `generatedWith`, or *Live · {provider}*) and the note "Wording comes from the model plus this app's skills, not measured search volume."
- `CommandMenu`: a cmdk popover per field with groups **Commands** and **Skills**. Seeded commands show previews from seed data. Non-seeded commands show "needs a key" without one, and call `/api/rewrite` with one. Picking a skill opens it in `SkillsPanel`.
- Right rail: `CommandsRail` (top right, the list with descriptions and seeded/key badges) and `SkillsPanel` (bottom right, tabs of the app's skill files as rendered Markdown, read-only).
- `FindingsPanel`: the output of `analyze()` for the current native fields, plus the engine's *why this term* notes for the current text (from seed or the applied preview).
- `PasteListing`: a dialog enabled only with a key; it calls `/api/localize`.
- `ExportButton`: downloads the JSON.
- Page state lives in a single `useReducer` (current app/market, field texts, applied commands). Changing app or market resets to seed values.

### Example App Skills
`data/examples/<app>/skills/*.md`. Implements `prd.md > Skills`.
- Per app: `brand.md` (voice, tone, words to avoid), `audience.md` (who, what they care about), `play-store.md` (limits and store rules relevant to the category). The files follow the `SKILL.md` style (frontmatter `name`, `description`, then guidance).
- Written by the author for this repo from their own apps' positioning and landing copy. Listed in the README disclosure as the author's own app content.

### README
`README.md` + `.github/assets/`. Implements `prd.md > Screens and Layout > README`.
- A greyscale banner via `<picture>` with light and dark SVG variants, grey shields.io badges, and the sections: what it is, Playground link, quick start, local run, how skills and commands work, project boundaries, and prior-work disclosure (updated with the rows below).

## Data Model
All data is files or page memory. There is no database.

```ts
// data/examples/<app>/listing.json
{ app: "bellyclock", appId: "com.bellyclock", name, category, sourceLocale: "en-US",
  fields: { title, short, full }, capturedAt, skills: ["brand", "audience", "play-store"] }

// data/examples/<app>/<market>.json   (market ∈ fr-FR | es-ES | de-DE)
{ market, phrases: { items: string[], source: "Google Play search suggestions", capturedAt },
  native: { fields: { title, short, full }, notes: { term, why }[] },
  commands: { [commandId in seeded]: { title?: Preview, short?: Preview, full?: Preview } },
  generatedWith: { provider: "gemini", model, at } }
// Preview = { text: string, notes: { term, why }[] }
```

| Data | Lives in | Updated by | When you leave and come back |
|---|---|---|---|
| Example listings, phrases, seeded results | JSON in repo | `bun run capture` / `bun run localize --seed` (author) | Unchanged |
| Skill files | Markdown in repo | Author edits | Unchanged |
| Current field text and applied commands | React state | Applying previews and typing | Reset to seed on reload or app/market change |
| Model key + provider | `sessionStorage` | KeyControl | Kept for the tab session, gone when it closes |
| Pasted listing and its result | React state | PasteListing | Gone on reload |

## File Structure

```
getlocalised-os/
├── app/
│   ├── layout.tsx                 # fonts, theme, metadata
│   ├── globals.css                # greyscale Slate tokens
│   ├── page.tsx                   # landing (docs-style)
│   ├── playground/page.tsx        # loads seed files, renders Playground
│   └── api/
│       ├── rewrite/route.ts       # BYOK: one field + command → previews
│       └── localize/route.ts      # BYOK: pasted listing → native listing
├── components/
│   ├── ui/                        # shadcn primitives (button, popover, command, dialog, tabs…)
│   ├── landing/                   # hero, hero-flow, section-nav, sections
│   └── playground/                # top-bar, key-control, phrases-panel, compare-view, field-row,
│                                  # char-count, command-menu, commands-rail, skills-panel,
│                                  # findings-panel, paste-listing, export-button, playground.tsx
├── lib/
│   ├── engine/                    # types.ts, commands.ts, prompt.ts, localize.ts,
│   │                              # providers/{gemini,openai,index}.ts
│   ├── findings/                  # limits.ts, phrases.ts, repetition.ts, stopwords.ts, index.ts (+ *.test.ts)
│   └── examples.ts                # typed loaders for data/examples
├── data/
│   ├── examples/
│   │   ├── aurasage/    { listing.json, fr-FR.json, es-ES.json, de-DE.json, skills/*.md }
│   │   ├── bellyclock/  { … }
│   │   └── lovetestai/  { … }
│   └── default-skills/  # generic brand/audience/play-store skills for pasted listings
├── scripts/
│   ├── capture.ts                 # build-time: real listings + Play search suggestions
│   └── localize.ts                # local run CLI; --seed writes data/examples
├── .github/assets/                # banner-light.svg, banner-dark.svg
├── .env.example                   # GEMINI_API_KEY=, OPENAI_API_KEY= (local run only)
├── devpost/                       # planning docs
└── README.md
```

## External Services and Dependencies

### Gemini API (`@google/genai`)
- Used by: the seed run (author's key, free tier) and live mode (visitor's key).
- Call: `new GoogleGenAI({ apiKey }).models.generateContent({ model, contents, config: { systemInstruction, responseMimeType: "application/json", responseSchema } })`.
- Free tier: per-minute and per-day limits, so the seed script paces and resumes. **On the free tier, Google may use prompts and outputs to improve its products.** That's acceptable here because the inputs are the author's public listings. Visitors' live use falls under their own key's terms.
- Docs: https://ai.google.dev/gemini-api/docs · structured output: https://ai.google.dev/gemini-api/docs/structured-output · limits: https://ai.google.dev/gemini-api/docs/rate-limits

### OpenAI API (`openai`)
- Used by: live mode only (visitor's key).
- Call: a structured-output request with a JSON schema. Confirm the recommended method (Responses vs Chat Completions) against the installed SDK early in the build.
- Docs: https://platform.openai.com/docs/guides/structured-outputs

### Google Play via `google-play-scraper` (build time only)
- `gplay.app({ appId, lang, country })` → the listing. `gplay.suggest({ term, lang, country })` → up to ~5 suggestion strings.
- Unofficial and read-only. It depends on Play's markup and is subject to Google's terms, which is why it runs only in `scripts/capture.ts`, occasionally, with pauses, and never in the deployed app.
- Docs: https://github.com/facundoolano/google-play-scraper

### Vercel (hosting)
- A new project for this repo, with domain `dev.getlocalised.com`. No env vars are needed.
- Docs: https://vercel.com/docs/domains/working-with-domains/add-a-domain

## Important Failure Modes
- **Visitor's key is wrong, out of credit, or rate-limited** → the route returns `invalid_key`/`quota` with a plain message in the command menu. The field keeps its text and seeded mode still works.
- **Model returns malformed or over-limit output** → zod rejects malformed output, with one retry and then "The model returned something unusable, try again". Over-limit output is shown with an "over limit" label, and *Fit the limit* is suggested.
- **Scraper fails at capture time** (Play markup change, block) → it affects only the author's build-time run, and the committed data keeps working. If it can't be fixed quickly, phrases can be curated by hand, but then they are labelled `source: "Curated by the author"`, never passed off as Play suggestions.
- **Seed run hits Gemini free-tier limits** → the script backs off, stops cleanly, and resumes from the missing entries on the next run.

## What Was Simplified and Why
- **JSON files in the repo** instead of a database: data is read-only and small (9 files). A database would add a service and accounts for no gain.
- **Build-time scraping** instead of live fetch: a deterministic demo, no runtime dependency on Play, and less exposure to Google's terms. Live fetch is deferred (`prd.md > Deferred From the POC`).
- **One preview per seeded command** (three only for live *Variants*) instead of several: this keeps the seed run at ~144 calls.
- **A Bun script** instead of a published CLI package: it proves the local run, and the full `getlocalised` CLI is deferred.
- **Deterministic findings** instead of model-judged quality: instant, free, testable, and they reveal no scoring method.
- **Read-only skills** in the Playground instead of editable ones: editing plus live re-runs is a later enhancement.

## Decisions and Open Issues

**Learner decisions**
- Mirror the main app's stack (Next 16, Tailwind/shadcn, cmdk, motion, zod, official SDKs, google-play-scraper).
- Host on Vercel as the subdomain `dev.getlocalised.com`, alongside the main app.
- Generate seeds with **Gemini** (free tier, author's key).
- The engine lives in this repo, and BYOK calls only this repo's routes (carried from the PRD).

**Implementation details derived from those decisions**
- The key travels in a request header, lives in `sessionStorage`, and is never logged.
- Picking a skill in the `/` menu opens it in the Skills panel; it doesn't rewrite text.
- Page state resets on reload or app/market change.
- Gemini proposes local seed terms; Play's `suggest()` supplies the real phrases.
- Model IDs are constants to confirm at build start.

**The useful unknown**
- *"Will the key work?"* (raised in `3-prd`). Clarified: the key goes with each request to this app's own `/api/rewrite` route, which calls the provider directly and discards it. Nothing private is involved. **To verify during the build:** one live Simplify run with a real Gemini key in the deployed Playground, confirming the preview returns and that the key appears in no log or response.

**Open issues**
- None blocking. The items under *To verify early in the build* (model IDs, SDK output options, scraper health, Next 16 route conventions) are checks, not decisions.
