import type { z } from "zod";

import type { Command } from "./commands";
import { localizePrompt, rewritePrompt, tooLongFeedback } from "./prompt";
import { EngineError, type ModelProvider } from "./providers/types";
import {
  FIELDS,
  LIMITS,
  LocalizeOutputSchema,
  RewriteOutputSchema,
  type Field,
  type Fields,
  type LocalizeOutput,
  type Market,
  type Preview,
  type Skill,
} from "./types";

/** Ask for JSON, validate it, and retry once if the shape is wrong. */
async function generateValidated<T>(
  provider: ModelProvider,
  prompt: { system: string; user: string },
  schema: z.ZodType<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await provider.generateJson({ ...prompt, schema });
      const parsed = schema.safeParse(raw);
      if (parsed.success) return parsed.data;
    } catch (err) {
      if (err instanceof EngineError) throw err;
      // JSON.parse failure: fall through to the retry.
    }
  }
  throw new EngineError("bad_output", "The model returned something unusable. Try again.");
}

function overLimit(fields: Partial<Record<Field, string>>) {
  return FIELDS.flatMap((f) => {
    const text = fields[f];
    return text !== undefined && text.length > LIMITS[f] ? [{ field: f, length: text.length }] : [];
  });
}

/** English listing → native listing for one market, with notes on the key word choices. */
export async function localizeListing(input: {
  source: Fields;
  market: Market;
  skills: Skill[];
  phrases: string[];
  provider: ModelProvider;
}): Promise<LocalizeOutput> {
  const prompt = localizePrompt(input);
  const first = await generateValidated(input.provider, prompt, LocalizeOutputSchema);
  const over = overLimit(first.fields);
  if (over.length === 0) return first;

  // One corrective pass; if it still breaks a limit, return it and let the findings label it.
  const retry = await generateValidated(
    input.provider,
    {
      system: prompt.system,
      user: `${prompt.user}\n\nYour previous answer:\n${JSON.stringify(first)}\n\n${tooLongFeedback(over)}`,
    },
    LocalizeOutputSchema,
  );
  return overLimit(retry.fields).length <= over.length ? retry : first;
}

/** One field + one command → preview(s). Nothing is applied; the caller decides. */
export async function rewriteField(input: {
  field: Field;
  text: string;
  sourceText: string;
  market: Market;
  skills: Skill[];
  phrases: string[];
  command: Command;
  freeText?: string;
  provider: ModelProvider;
}): Promise<Preview[]> {
  if (input.command.id === "custom" && !input.freeText?.trim())
    throw new EngineError("bad_input", "Write an instruction for the custom command.");
  const prompt = rewritePrompt(input);
  const out = await generateValidated(input.provider, prompt, RewriteOutputSchema);
  const previews = out.previews.slice(0, input.command.previews);
  if (previews.every((p) => p.text.length <= LIMITS[input.field])) return previews;

  const retry = await generateValidated(
    input.provider,
    {
      system: prompt.system,
      user: `${prompt.user}\n\nYour previous answer:\n${JSON.stringify(out)}\n\n${tooLongFeedback(
        previews.filter((p) => p.text.length > LIMITS[input.field]).map((p) => ({ field: input.field, length: p.text.length })),
      )}`,
    },
    RewriteOutputSchema,
  );
  return retry.previews.slice(0, input.command.previews);
}
