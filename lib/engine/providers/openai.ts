import OpenAI, { APIError } from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { EngineError, type ModelProvider } from "./types";

/** A small, stable model from the installed SDK's model list (checked 2026-09-29). */
export const OPENAI_DEFAULT_MODEL = "gpt-5.4-mini";

export function openaiProvider(apiKey: string, model = OPENAI_DEFAULT_MODEL): ModelProvider {
  const client = new OpenAI({ apiKey });
  return {
    id: "openai",
    model,
    async generateJson({ system, user, schema }) {
      try {
        const res = await client.responses.parse({
          model,
          instructions: system,
          input: user,
          text: { format: zodTextFormat(schema, "result") },
        });
        if (res.output_parsed == null) throw new EngineError("bad_output", "OpenAI returned an empty answer.");
        return res.output_parsed;
      } catch (err) {
        if (err instanceof EngineError) throw err;
        throw mapOpenAIError(err);
      }
    },
  };
}

function mapOpenAIError(err: unknown): EngineError {
  if (err instanceof APIError) {
    if (err.status === 401 || err.status === 403) return new EngineError("invalid_key", "The key was rejected by OpenAI.");
    if (err.status === 429) return new EngineError("quota", "OpenAI says this key is out of credit or rate-limited.");
    if (err.status && err.status >= 500) return new EngineError("provider_error", `OpenAI is temporarily unavailable (${err.status}).`);
    return new EngineError("provider_error", `OpenAI returned an error (${err.status ?? "unknown"}).`);
  }
  return new EngineError("provider_error", "Could not reach OpenAI.");
}
