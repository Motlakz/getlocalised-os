import type { z } from "zod";

export type ProviderId = "gemini" | "openai";

export type ErrorCode = "invalid_key" | "quota" | "bad_output" | "bad_input" | "provider_error";

/** Errors the engine surfaces to the Playground and the local run, with plain wording. */
export class EngineError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

export interface ModelProvider {
  id: ProviderId;
  model: string;
  /** One request that must return JSON matching `schema`. Throws EngineError. */
  generateJson<T>(req: { system: string; user: string; schema: z.ZodType<T> }): Promise<T>;
}

export const PROVIDER_NAMES: Record<ProviderId, string> = { gemini: "Gemini", openai: "OpenAI" };
