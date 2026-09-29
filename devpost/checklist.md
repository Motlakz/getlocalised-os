---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. The engine turns BellyClock's real English listing into a native German one, locally**
  Becomes usable: `bun run capture --app bellyclock` pulls the real Play listing and German search suggestions into `data/examples/bellyclock/`, and `bun run localize --app bellyclock --to de-DE` prints a native listing with *why this term* notes.
  Why now: This is the riskiest part (does the scraper still work, does Gemini's structured output behave) and it is the kernel. Everything else displays what this produces. Bootstrapping (dependencies, env, folders) happens here.
  PRD ref: `prd.md > Local Run`, `prd.md > Example Apps and Seeded Data`, `prd.md > Native Listing and Compare View`
  Spec ref: `spec.md > Engine`, `spec.md > Commands`, `spec.md > Seed Pipeline`, `spec.md > Example App Skills`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`
  Build: Install `@google/genai`, `openai`, `zod`, `google-play-scraper`; add `.env.example`; verify current Gemini model ID and structured-output options; write `lib/engine` (types, commands, prompt, providers/gemini, localize) and `lib/examples.ts`; draft BellyClock skill files (brand, audience, play-store) for the learner to review; write `scripts/capture.ts` and `scripts/localize.ts` (single run + `--seed` for native listing); add `capture` and `localize` package scripts.
  Verify (mechanical): Run capture for BellyClock and confirm `listing.json` has non-empty title/short/full and `de-DE.json` has ≥5 phrases with source and date. Run localize for de-DE and confirm the output passes the zod schema, the title is ≤30 and short ≤80 characters, and the text is German. Run `bunx tsc --noEmit` clean.
  Learner check: Read the generated German listing next to the English one in the terminal and say whether it reads native rather than translated. Also say whether the BellyClock skill files sound like your brand.
  Commit: `Add localization engine, capture and local run for BellyClock`

- [x] **2. The Playground shows English vs native German side by side, with findings**
  Becomes usable: `/playground` shows BellyClock's English listing left and the seeded German listing right, with character counts, the phrase panel, *Generated with … · date*, the model+skills note, and findings (phrase usage, repetition, limits, why-this-term notes).
  Why now: It makes the kernel visible to a judge, and it is the first thing worth your eyes. The greyscale Slate look gets established here, so later UI inherits it.
  PRD ref: `prd.md > Native Listing and Compare View`, `prd.md > Findings`, `prd.md > Look and Feel`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Playground`, `spec.md > Findings`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: Set up shadcn, greyscale Slate tokens in `globals.css`, and fonts in `layout.tsx`; write `lib/findings` (limits, phrases, repetition, stopwords, index) with `bun test` tests; build `app/playground/page.tsx`, TopBar (static app/market labels for now), PhrasesPanel, CompareView/FieldRow/CharCount with copy buttons, and FindingsPanel.
  Verify (mechanical): `bun test` passes for findings; `bunx tsc --noEmit` and `bun run lint` are clean; `bun run build` succeeds; fetching `/playground` from the dev server returns 200 and the HTML contains the German title and "Generated with".
  Learner check: Open http://localhost:3000/playground. Does it look like a greyscale sibling of your app? Do the findings make sense for the German text?
  Commit: `Add Playground compare view with findings`

- [ ] **3. The `/` menu reshapes a field from seeded commands, and skills are visible**
  Becomes usable: Typing `/` in a German field (or clicking its button) opens the Commands + Skills menu. The five seeded commands show previews; picking one replaces the text and findings update. The Commands rail sits top right and the Skills panel bottom right.
  Why now: This is the demo's "oh, that's cool" beat, and it only needs slice 2's screen plus seeded command data.
  PRD ref: `prd.md > Commands`, `prd.md > Skills`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Commands`, `spec.md > Playground`, `spec.md > Seed Pipeline`, `spec.md > Example App Skills`
  Build: Extend `localize --seed` to generate seeded commands × fields; run it for BellyClock de-DE; add cmdk CommandMenu (groups, seeded previews, "needs a key" state), CommandsRail, SkillsPanel (rendered Markdown tabs), and the page reducer for applied edits.
  Verify (mechanical): `de-DE.json` has all 5 commands × 3 fields, each passing the schema; tsc, lint and build are clean; a reducer unit test shows applying a preview changes the field and dismissing doesn't.
  Learner check: On the German title, type `/`, pick *Punchier*, and apply it. Did the text and findings change? Open a skill from the menu and check it shows bottom right.
  Commit: `Add slash command menu, commands rail and skills panel`

- [ ] **4. All three apps in fr-FR, es-ES, de-DE are seeded and switchable, with export**
  Becomes usable: The app and market pickers switch between AuraSage, BellyClock and LoveTest AI across all three markets, each fully seeded. Export downloads the listing JSON.
  Why now: Once the one-app flow is proven, widening is mostly data. Doing it before live mode keeps the no-key demo complete first.
  PRD ref: `prd.md > Example Apps and Seeded Data`, `prd.md > Copy and Export`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Seed Pipeline`, `spec.md > Example App Skills`, `spec.md > Playground`, `spec.md > Data Model`
  Build: Draft AuraSage and LoveTest AI skill files for review; run capture and `localize --seed` for all 9 combinations (resumable, paced); add AppPicker/MarketPicker with URL params and reset-on-switch; add ExportButton.
  Verify (mechanical): A script validates all 9 `<market>.json` files against the zod schema (native + 5×3 commands, phrases ≥5, generatedWith present); build is clean; each `/playground?app=…&market=…` returns 200 with that app's native title.
  Learner check: Switch across all three apps and markets. Does each read native? Export one and open the file.
  Commit: `Seed all example apps and markets, add pickers and export`

- [ ] **5. With a key, every command and "paste your own listing" run live**
  Becomes usable: Paste a Gemini or OpenAI key and the non-seeded commands, free-form command, and Paste Listing all return fresh results through `/api/rewrite` and `/api/localize`. Bad keys show plain errors.
  Why now: It builds on a complete seeded demo, and its failure modes (keys, quotas) can't break anything before it.
  PRD ref: `prd.md > Bring Your Own Key (Playground)`, `prd.md > Commands`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Rewrite and Localize Routes`, `spec.md > Engine`, `spec.md > Playground`, `spec.md > Important Failure Modes`, `spec.md > Decisions and Open Issues`
  Build: Read Next 16 route handler docs; add `providers/openai` (verify model ID and structured output); add both routes with zod input, error mapping and no logging; add `data/default-skills`; add KeyControl (sessionStorage), live command calls, and the PasteListing dialog.
  Verify (mechanical): A request to `/api/rewrite` with a fake key returns `invalid_key`; a request with no body field returns `bad_input`; a request with a real Gemini key from `.env.local` returns previews; grep the route code for any logging of headers/body (none); tsc, lint and build are clean.
  Learner check: Paste your Gemini key, run *Simplify* on a field, then paste a listing of one of your other apps and generate German. Try a wrong key and read the message.
  Commit: `Add BYOK live commands and paste-your-own-listing`

- [ ] **6. The landing page tells the story and leads into the Playground**
  Becomes usable: `/` is a docs-style page with an animated hero replaying BellyClock → de-DE, sections (What it does, Skills and commands, Run it locally, Project boundaries), a sticky section nav, **Open Playground** and **GitHub**.
  Why now: It presents a product that now fully works, and its hero reuses real seed data from slice 4.
  PRD ref: `prd.md > Landing Page`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Landing Page`, `spec.md > Look and Feel`
  Build: Replace the scaffold `app/page.tsx`; add `components/landing` (Hero, HeroFlow with motion and reduced-motion support, SectionNav, sections); metadata and OG title.
  Verify (mechanical): Build is clean; `/` returns 200 with the headline and a link to `/playground?app=bellyclock&market=de-DE`; lint clean.
  Learner check: Open http://localhost:3000. Does the hero feel cinematic enough, and does the page read like good open-source docs?
  Commit: `Add docs-style landing page with animated hero`

- [ ] **7. The README matches the product and the repo is ready to publish**
  Becomes usable: A styled greyscale README (banner light/dark, badges, quick start, local run, how it works, boundaries) and an updated prior-work table (Slate tokens, command names, the author's app listings/skills content, `google-play-scraper` data).
  Why now: It comes last because it documents what actually got built.
  PRD ref: `prd.md > Screens and Layout` (README), `prd.md > Local Run`
  Spec ref: `spec.md > README`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Create `.github/assets/banner-{light,dark}.svg`; rewrite README.md; clean up unused scaffold assets in `public/`.
  Verify (mechanical): Every README command runs as written from a clean state (`bun install`, `bun dev`, `bun run localize …`); relative links and images resolve; no secrets in the tracked files (grep for key patterns).
  Learner check: Preview README.md (GitHub preview or VS Code) in light and dark. Does it look like the product's family?
  Commit: `Add styled README and update prior-work disclosure`

## Hands-on Checkpoints

- [x] Early usable behavior explored: after slice 2 (the kernel on screen), where feedback on look and native quality can still shape slices 3–6
- [ ] Final kick-the-tires exploration and feedback completed

Early checkpoint feedback (after slice 2): the look is right and the listing is accurate and native, with its explanation. It is "more informative than usable" for now, which slice 3's commands address. Asked for dark mode as the default plus a theme toggle, which was done before slice 3.

## Final Review

- [ ] Final review complete: feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete: guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed: offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Gemini default model is `gemini-3.5-flash-lite`, not the spec's placeholder `gemini-2.5-flash`. The build found `gemini-2.5-flash` no longer accepts new users, and the newest Flash models (3.6–3.8) repeatedly returned 503 "high demand" on this key. The learner chose Flash-Lite because it stays available. The model is still one constant and overridable with `--model`.
- Transient provider errors (5xx) are retried with backoff (20s/60s/120s), like rate limits. Capture and the single local run use the same retry, because the first real runs hit demand spikes.
- The Playground uses static routes `/playground/<app>/<market>` (built with `generateStaticParams`) instead of `/playground?app=…&market=…`, and `/playground` redirects to BellyClock → de-DE. The build showed that query params would make the page dynamic and read seed files from disk on Vercel at request time; static routes read them only at build. Switching app or market navigates to another page, which gives the planned reset-on-switch for free.
- `shadcn add` without an existing `lib/utils` rewrote imports to a bare `cn` package and installed it. Fixed by adding `lib/utils.ts`, restoring the imports, removing the package and installing the real dependencies (radix-ui, cva, clsx, tailwind-merge, hugeicons, tw-animate-css).
- Dark mode is now the default with a light/dark toggle, instead of following the system. Learner feedback at the slice 2 checkpoint.
