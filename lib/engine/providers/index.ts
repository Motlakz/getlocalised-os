import { geminiProvider } from "./gemini";
import { EngineError, type ModelProvider, type ProviderId } from "./types";

export function createProvider(id: ProviderId, apiKey: string, model?: string): ModelProvider {
  if (!apiKey.trim()) throw new EngineError("invalid_key", "No key was provided.");
  switch (id) {
    case "gemini":
      return geminiProvider(apiKey.trim(), model);
    default:
      throw new EngineError("bad_input", `Provider "${id}" is not supported yet.`);
  }
}

export * from "./types";
