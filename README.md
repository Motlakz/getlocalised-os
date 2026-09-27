# GetLocalised OSS

Open-source developer tooling for localizing mobile app store listings. Scope, requirements and technical plan are being written with the Build With AI: Basics skill pack and will live in `devpost/` (`scope.md`, `prd.md`, `spec.md`).

Entry for Devpost's **Build With AI: Basics** (submission period 2026-09-22 → 2026-10-26).

## Running it

```bash
bun install
bun dev   # http://localhost:3000
```

## Prior work disclosure

This repository was created on **2026-09-27**, inside the submission period. Everything in it was written during that period except the items below, which are disclosed as required by the rules.

| Incorporated | Source | Notes |
| --- | --- | --- |
| Next.js app scaffold (`app/`, configs, `AGENTS.md`, `CLAUDE.md`) | `create-next-app` 16.3.6 | Standard development tooling, generated unmodified |
| Build With AI: Basics skill pack (`.claude/skills`, `.agents/skills`, `skills-lock.json`) | [challengepost/learn-ai-basics](https://github.com/challengepost/learn-ai-basics) | Course material; copies for Claude Code and Codex |

**Related work that is not incorporated.** The author also builds GetLocalised, a separate, private commercial product for app store localization (started 2026-09-26). No source code, prompts, data or assets from it are included in this repository. This project may explore some of the same ideas; anything that is ever reused from it will be listed in the table above.

Keep this section current: add a row whenever pre-existing code, assets or third-party work is incorporated.
