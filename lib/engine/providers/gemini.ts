import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { EngineError, type ModelProvider } from "./types";

/** Checked against the models list on 2026-09-29: the newest stable Flash-Lite, which stays available when Flash hits demand spikes. */
export const GEMINI_DEFAULT_MODEL = "gemini-3.5-flash-lite";

export function geminiProvider(apiKey: string, model = GEMINI_DEFAULT_MODEL): ModelProvider {
  const ai = new GoogleGenAI({ apiKey });
  return {
    id: "gemini",
    model,
    async generateJson({ system, user, schema }) {
      let text: string | undefined;
      try {
        const res = await ai.models.generateContent({
          model,
          contents: user,
          config: {
            systemInstruction: system,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
            temperature: 0.7,
          },
        });
        text = res.text;
      } catch (err) {
        throw mapGeminiError(err);
      }
      if (!text) throw new EngineError("bad_output", "Gemini returned an empty answer.");
      return JSON.parse(text);
    },
  };
}

function mapGeminiError(err: unknown): EngineError {
  if (err instanceof ApiError) {
    const msg = err.message ?? "";
    if (err.status === 429) return new EngineError("quota", "Gemini says this key is out of quota or rate-limited.");
    if (err.status === 401 || err.status === 403 || /API key not valid|API_KEY_INVALID/i.test(msg))
      return new EngineError("invalid_key", "The key was rejected by Gemini.");
    if (err.status >= 500) return new EngineError("provider_error", `Gemini is temporarily unavailable (${err.status}).`);
    return new EngineError("provider_error", `Gemini returned an error (${err.status}): ${msg.slice(0, 160)}`);
  }
  return new EngineError("provider_error", "Could not reach Gemini.");
}
