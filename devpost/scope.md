---
doc: scope
status: approved
---

# GetLocalised OS

An open-source localization agent for mobile apps. It turns one Play Store listing into a *native* listing for another market, guided by reusable skills you can read and edit, with your own model key or a built-in example that needs no key.

## The Unique Kernel
**Native, not translated, and shaped by skills you can see.** The output is a listing that keeps the original's meaning while using the words people in that country actually search with. It is not a literal translation of each line. What shapes it is a set of plain skill files (brand, audience, store rules, ASO guidance) that the developer can open, edit, and re-run. The skills do the work that currently means pasting each line and each country's search terms into a chat model.

## Who It's For
A solo developer shipping several apps in several languages and regions. Today they update each Play Store listing by hand, language by language, and ask an AI model about each line one at a time. With multiple apps this gets tedious. They want an automated, connected process that cuts that work in half.

## The Core Loop
Pick an app (an example app, or paste your own listing) → its listing is loaded → choose a target language/market → watch a native listing form, guided by the skills → copy or export it into the store. Then do the same for the next language or the next app.

## Inspiration & Identity
- Reusable, open skill formats: the ASO skills (`aso`, `android-aso`, `localization`, `keyword-research`, `metadata-optimization`) and the `app-store-screenshots` skill. They are referenced by link, not copied in.
- The developer-site framing: `dev.getlocalised.com`, with Overview, Playground, Docs, Skills, CLI, Examples, GitHub, and Self-hosting.
- **Visual identity:** the original GetLocalised "Slate" design (near-black ink, sage greys, Raleway headings / Source Sans body / Merriweather serif), but **greyscale instead of lime**. This is its own species with a matching family resemblance. The landing page, Playground, and README all share it.
- It stands on its own: someone could fork this tomorrow and get a genuinely useful localization agent. The product never mentions any other edition.

## Why This Matters to the Learner
It is their own daily pain across a portfolio of apps. It should be "a legitimate OSS developer product", complete in itself rather than a cut-down demo. They also want to get more adept at working with agents.

## What "Working" Looks Like
A hosted Playground that a judge can open with **no setup and no key**:
1. Pick an example app (one of the author's real apps, with its listing pre-fetched and its category and search flow predefined).
2. Pick a target language, e.g. `de-DE`.
3. Watch the native listing form. Each field is checked against Play Store character limits, and the listing is clearly not a word-for-word translation.
4. Copy or export it.

**The "oh, that's cool" beat:** edit a skill (e.g. the brand/audience rules), re-run, and see the listing change accordingly. Then paste your own API key (BYOK) and run the same flow live.

## The POC Boundary
- Hosted Playground, the main surface.
- A minimal landing page for `dev.getlocalised.com`: what it is, a way into the Playground, and a link to GitHub. It uses the greyscale Slate design and ships with the same deploy.
- A README styled to match: a banner, a clear structure, and the same greyscale identity, within what GitHub can render.
- Example apps: the author's own published listings as fixtures, each with a predefined category and search flow, so the demo is **deterministic** without a key.
- "Paste your own listing" as the way to bring any other app.
- Target-language selection, and native listing generation for Play Store metadata (title, short description, full description).
- Visible, editable skills that feed the generation.
- BYOK live mode: the user brings their own model key, which is never stored server-side.
- Play Store constraint validation (character limits) and basic quality checks.
- Copy and export only. No store upload.

## Later
- CLI (`getlocalised localize --from en-US --to de-DE,fr-FR`) using the `.getlocalised/skills` and `getlocalised.config.ts` format, running locally so key handling and upload stay in the developer's own environment.
- Screenshot localization. The core offering is defined without it; it gets added as the open-source edition grows. (Would build on the `app-store-screenshots` skill; the author's own `store_screenshots` work would need a README disclosure row if used.)
- Fetching any app live by package ID or store URL, beyond the example apps. Not essential to the proof of concept; Google Play has no official public listing API, so this needs a deliberate choice about data sources.
- App Store (iOS) metadata.
- The remaining dev-site sections: Docs, Skills, CLI, Examples, Self-hosting.

## Explicitly Cut
- **Measured search-volume and keyword data, competitor/market intelligence, ranking and opportunity scoring.** These need data infrastructure outside this project's purpose. Native wording here comes from the model plus the developer's skills.
- **Store upload and publishing via Play Console.** Credentials are sensitive. Copy and export cover the need, and the developer keeps control of their keys.
- **Mentioning any other edition in the product.** This project stands alone. (The README's prior-work disclosure still names related work, as the hackathon rules require.)
- **Code, prompts, or data from other projects.** Ideas may overlap; anything actually reused, including design tokens, gets listed in the README's prior-work table.
