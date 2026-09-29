---
doc: prd
status: approved
---

# GetLocalised OS — Product Requirements

An open-source localization agent that turns a Play Store listing into a *native* listing for French, Spanish, and German markets, shown in a hosted Playground and runnable locally, for a solo developer shipping several apps in several languages.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. A visitor lands on `dev.getlocalised.com`. The hero plays a short animated mockup of the real flow (pick app → pick market → native listing forms → findings appear), then offers **Open Playground**.
2. In the Playground they pick an example app: **AuraSage** (wellness, affirmations), **BellyClock** (health, fasting), or **LoveTest AI** (entertainment).
3. They pick a market: **fr-FR**, **es-ES**, or **de-DE**. The market's local search phrases appear, labelled with their source and capture date.
4. The English listing appears on the left and the native listing on the right, field by field (title, short description, full description). Each field shows its character count against the Play Store limit.
5. Findings sit alongside the native listing: which local phrases it uses and where, repeated words ("'example' appears 5 times"), and a short *why this term* note for the key choices.
6. They type `/` on a field (or click its command button) and pick one of the five seeded commands. Previews appear, and nothing changes until they pick one. Picking one replaces the field text, and the findings update.
7. They copy a field or export the whole listing.
8. *(Optional)* They paste their own model key. The full command list, free-form commands, and "paste your own listing" become live.

Success: in under a minute, with no key and no setup, a judge sees an English listing become a native German one, sees why the wording was chosen, and sees a command visibly reshape a field.

## Screens and Layout

### Landing page (`dev.getlocalised.com`)
- A developer-documentation style layout, modelled on popular open-source project docs: informative and structured, with clear sections, not a marketing splash.
- **Hero:** an interactive, animated code/UI mockup of the real flow in quick steps. It uses real example data (e.g. BellyClock → de-DE), in the spirit of the "studios" section of the original GetLocalised landing page. Animated transitions only, no video.
- Primary call to action: **Open Playground**. Secondary: **GitHub**.
- Short sections explaining what it does, how skills and commands shape the output, and how to run it locally.

### Playground
- **Top bar:** example app picker, market picker, and a model-key control (shows "No key: seeded mode" or "Key active: live mode").
- **Search phrases panel:** the selected market's local search phrases, with a source/date label.
- **Compare view:** English source on the left, native listing on the right, field by field, each with a character count and limit.
- **Findings:** shown next to the native listing, per field and overall.
- **Command menu:** a stylized, contextual `/` dropdown per field, like the original app's command palette, with two sections: **Commands** and **Skills**. Seeded commands are always available; the rest are marked as needing a key.
- **Side rail (right):** **Commands** at the top right (the command list with descriptions) and **Skills** at the bottom right: a small content section showing the selected example app's skill files (e.g. brand, audience, store rules), read-only.
- **Copy / Export** actions.

### README
Styled to match: a greyscale banner, a clear structure, and matching badges, within what GitHub renders (no custom CSS).

## Look and Feel
- The original GetLocalised **Slate** design, in **greyscale instead of lime**: near-black ink, neutral greys, no lime accent. Raleway headings, Source Sans body, Merriweather serif.
- The Playground follows the original app's UI patterns: side-by-side compare, character counts, and the `/` command palette with previews.
- **Dark mode is the default**, with a light/dark toggle in the top bar that remembers the choice (from the slice 2 checkpoint).
- Motion: cinematic, smooth step transitions in the hero. Built from code, not video.
- Landing structure: the informative, documentation-like layout of popular open-source developer projects.
- To avoid: generic AI-app styling and any lime/brand colour from the original.

## Features and Behavior

### Example Apps and Seeded Data
Develops `scope.md > The POC Boundary` (deterministic example apps).
- Three example apps, each with its real English Play listing, a category, and three markets (fr-FR, es-ES, de-DE).
- For each app and market: local search phrases, captured once at build time from Google Play search suggestions and shown with that capture date.
- For each app and market: a native listing, plus the result of each seeded command on each field. All of it is **generated by this project's own engine** in a real run, not written by hand.
- [ ] Every app × market combination (9) shows a complete native listing without a key.
- [ ] The search phrases panel shows its source and capture date.
- [ ] Seeded results say they were generated by the engine, and when.

### Native Listing and Compare View
Develops `scope.md > The Unique Kernel`.
- [ ] English source on the left and native listing on the right, aligned by field.
- [ ] Each field shows its character count against the Play limit (title 30, short description 80, full description 4000). A field over the limit is marked with a label, not colour alone.
- [ ] A visible note says the wording comes from the model plus the skills, not from measured search volume.

### Findings
Develops `scope.md > The POC Boundary` (quality checks). Written from scratch for this project; no scoring or demand figures.
- [ ] Phrase usage: each local search phrase is marked as used in the title, short description, full description, or not used.
- [ ] Repetition: words used too often are flagged with their count ("'example' appears 5 times, consider rephrasing").
- [ ] Limits: any field over its limit is flagged.
- [ ] *Why this term:* short explanations for key word choices, produced by the engine during generation.
- [ ] Findings update when a command's result is applied.

### Commands
Develops the "oh, that's cool" beat in `scope.md > What "Working" Looks Like`.
- Seeded (work without a key): **Sound native**, **Search terms**, **Punchier**, **Lead with the benefit**, **Fit the limit**.
- With a key, the remaining commands are also live: **Shorter**, **Simplify**, **More formal**, **More casual**, **Variants**, plus a free-form command.
- Commands apply to one field at a time and show previews first. Nothing changes until the user picks one.
- [ ] Typing `/` in a field, or clicking its command button, opens the menu with each command's one-line description.
- [ ] A seeded command shows a brief running state (about a second), then its prepared result, labelled "Prepared result · <model>", without a key. *(Learner request during slice 4: results shouldn't appear as if they'd always been there, but they're still labelled honestly.)*
- [ ] Picking a preview replaces the field and updates character count and findings. Dismissing leaves the field unchanged.
- [ ] Without a key, non-seeded commands are visible but marked "needs a key" and point to the key control.

### Skills
Develops `scope.md > The Unique Kernel` ("shaped by skills you can see").
- Each example app has its own skill files (e.g. brand, audience, store rules) that the engine uses when generating.
- Skills appear as their own section in the `/` menu and in the Skills panel at the bottom right of the Playground.
- [ ] The Skills panel shows the selected app's skill files, and the content changes when the app changes.
- [ ] The `/` menu lists skills in a section separate from commands.

### Bring Your Own Key (Playground)
- Providers: OpenAI and Gemini.
- The key is sent with each live request to this project's own server, used to call the provider, and discarded. It is never stored or logged, and the UI states that in plain words next to the input.
- The key lasts only for the browser session.
- With a key: all commands run live on the current field, and **Paste your own listing** is enabled (paste English title, short, and full description, pick a market, generate).
- [ ] With a valid key, a non-seeded command returns fresh previews.
- [ ] With a key, a pasted listing produces a native listing with findings.

### Copy and Export
- [ ] Each native field has a copy button.
- [ ] The whole native listing can be exported as a file (all three fields, with the market code).

### Local Run
Develops `scope.md > Later` (CLI), narrowed to what the proof of concept needs.
- Someone who clones the repo can run the same engine locally with their own key: pick an app/listing, a market, and a command, and get the native listing and findings as output.
- The same local run generates the Playground's seeded data.
- [ ] Following the README, a developer can run it locally with their own key and get a native listing for one market.

### Landing Page
- [ ] The hero animation plays the flow steps using real example data, and loops or replays.
- [ ] **Open Playground** opens the Playground with an example app preselected.
- [ ] **GitHub** links to the public repository.

## States and Boundaries
- **First visit (Playground):** an example app and a market are preselected, so the compare view is full immediately. The key control shows seeded mode.
- **No key:** seeded commands work; others are marked "needs a key"; paste-your-own-listing is disabled, with a note on how to enable it.
- **Invalid key or provider error (e.g. out of credit):** a plain message naming the problem ("The key was rejected by OpenAI" / "Out of credit"). The field keeps its previous text, and seeded mode still works.
- **Pasted listing is empty or too short:** generation is blocked with a note saying which field is missing.
- **Over-limit result:** shown with an "over limit" label so it can be fixed with *Fit the limit*.
- **Persistence:** nothing is saved. Applied edits and the key last only for the browser session; reloading returns to the seeded state.

## Product Decisions
- **Example apps are the learner's own apps** (AuraSage, BellyClock, LoveTest AI): they create relatability and aren't randomly chosen.
- **Markets: fr-FR, es-ES, de-DE for all three:** where the learner usually starts.
- **Keyword approach: option (a).** A visible phrase list plus a transparent check written fresh here. No scoring methodology, so the method stays private.
- **Scraper runs once at build time, not live:** the data is real and dated, and the demo can't break from Google changes or rate limits.
- **Five seeded commands** (Sound native, Search terms, Punchier, Lead with the benefit, Fit the limit), one field at a time with previews. The command names and one-line descriptions are adapted from the original app's command palette.
- **BYOK in the Playground calls this repo's own engine, never another service.** It keeps the boundary: no production backend, no private prompts, and users' keys never reach a closed server.
- **Same UI patterns and Slate design as the original app, recoloured greyscale.** It's a separate species with a family resemblance.
- **The product never mentions another edition.**
- **Skills are visible:** a separate section in the `/` menu plus a read-only Skills panel (bottom right), under Commands (top right).
- **Keys last for the browser session. Providers are OpenAI and Gemini.** Errors name the problem and keep the field unchanged.

## What We're Building
- Landing page with an animated hero, a docs-style layout, and the Playground CTA.
- Playground: app and market pickers, search phrases panel, compare view, findings, `/` command menu (Commands + Skills), right rail (Commands top, Skills bottom), copy/export, and the key control.
- Seeded data for 3 apps × 3 markets: phrases (build-time capture), native listings, and results of the five commands for each field, all generated by the engine.
- The engine: skills + command + listing + market → native text and findings, callable from the Playground (with a key) and locally.
- The local run, documented in the README.
- A styled greyscale README with the prior-work table updated (Slate design tokens and command names adapted from the author's GetLocalised app).

## Deferred From the POC
- **Screenshot localization:** a separate pipeline; the core offering stands without it.
- **Live fetch by package ID or store URL:** needs a live scraper dependency; pasting covers it for now.
- **Combining commands:** the number of prepared results multiplies; one at a time proves the idea.
- **Full CLI** (`getlocalised localize --from … --to …` with `.getlocalised/` config): the local run covers the proof.
- **Remaining dev-site sections:** Docs, Skills, CLI, Examples, Self-hosting.
- **iOS App Store metadata.**

## Possible Later Enhancements
- More markets and more example apps.
- Editable skill files in the Playground (brand, audience, tone) that feed live runs.
- Importing a `.getlocalised/` folder.

## Non-Goals
- **Measured search volume, keyword scoring, competitor or market intelligence:** out of this project's purpose, and the wording is model + skills.
- **Store upload or Play Console connection:** credentials are sensitive, and copy/export keeps the developer in control.
- **Calling any external service other than the user's chosen model provider:** it stays self-contained and forkable.
- **Storing keys, accounts, or saved projects.**
- **Mentioning another edition in the product.**

## Open Questions
None. The skill visibility and error wording questions were resolved in review.
