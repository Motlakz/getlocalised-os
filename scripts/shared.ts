import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { EngineError, MARKETS, type Market } from "../lib/engine";
import { EXAMPLE_APPS, isExampleApp } from "../lib/examples";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function writeJson(file: string, data: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function pickApps(value: string | undefined): string[] {
  if (!value) return EXAMPLE_APPS.map((a) => a.app);
  const apps = value.split(",").map((s) => s.trim());
  for (const app of apps) if (!isExampleApp(app)) fail(`Unknown app "${app}". Use: ${EXAMPLE_APPS.map((a) => a.app).join(", ")}`);
  return apps;
}

export function pickMarkets(value: string | undefined): Market[] {
  if (!value) return [...MARKETS];
  const markets = value.split(",").map((s) => s.trim());
  for (const m of markets) if (!(MARKETS as readonly string[]).includes(m)) fail(`Unknown market "${m}". Use: ${MARKETS.join(", ")}`);
  return markets as Market[];
}

export function requireKey(provider: string): string {
  const name = provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY";
  const key = process.env[name];
  if (!key) fail(`${name} is not set. Copy .env.example to .env.local and add your key.`);
  return key;
}

/** Retries a model call when it is rate-limited or hits a transient provider error; other errors pass through. */
export async function withBackoff<T>(label: string, fn: () => Promise<T>, waits = [20_000, 60_000, 120_000]): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = err instanceof EngineError && (err.code === "quota" || err.code === "provider_error");
      if (retryable && i < waits.length) {
        console.log(`  ${err.message} (${label}); waiting ${waits[i] / 1000}s…`);
        await sleep(waits[i]);
        continue;
      }
      throw err;
    }
  }
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
