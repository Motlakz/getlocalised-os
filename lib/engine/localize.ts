import type { z } from "zod";

import type { Command } from "./commands";
import { claimFeedback, localizePrompt, rewritePrompt, tooLongFeedback } from "./prompt";
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
  type Note,
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

/** The engine has no demand data, so a note claiming volume or popularity would be made up. */
const DEMAND_CLAIM =
  /\b(high[- ]volume|search volume|most (searched|popular|used|common)|popular|frequently (used|searched)|commonly (used|searched)|widely (used|searched)|high[- ]intent|top search)/i;

export const hasDemandClaim = (why: string) => DEMAND_CLAIM.test(why);

const unsupported = (notes: Note[]) => notes.filter((n) => DEMAND_CLAIM.test(n.why));

/** Drops notes that still claim demand after the corrective pass, rather than show an unsupported claim. */
const withoutClaims = (notes: Note[]) => notes.filter((n) => !DEMAND_CLAIM.test(n.why));

function feedback(over: { field: Field; length: number }[], claims: Note[]): string {
  return [over.length ? tooLongFeedback(over) : "", claims.length ? claimFeedback(claims) : ""].filter(Boolean).join("\n\n");
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
  const issues = (o: LocalizeOutput) => ({ over: overLimit(o.fields), claims: unsupported(o.notes) });
  const count = (i: ReturnType<typeof issues>) => i.over.length + i.claims.length;

  const first = await generateValidated(input.provider, prompt, LocalizeOutputSchema);
  const firstIssues = issues(first);
  if (count(firstIssues) === 0) return first;

  // One corrective pass; whatever still breaks a limit is labelled by the findings.
  const retry = await generateValidated(
    input.provider,
    {
      system: prompt.system,
      user: `${prompt.user}\n\nYour previous answer:\n${JSON.stringify(first)}\n\n${feedback(firstIssues.over, firstIssues.claims)}`,
    },
    LocalizeOutputSchema,
  );
  const best = count(issues(retry)) <= count(firstIssues) ? retry : first;
  return { ...best, notes: withoutClaims(best.notes) };
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
  const clean = (previews: Preview[]) => previews.map((p) => ({ ...p, notes: withoutClaims(p.notes) }));
  const out = await generateValidated(input.provider, prompt, RewriteOutputSchema);
  const previews = out.previews.slice(0, input.command.previews);
  const over = previews.filter((p) => p.text.length > LIMITS[input.field]).map((p) => ({ field: input.field, length: p.text.length }));
  const claims = unsupported(previews.flatMap((p) => p.notes));
  if (over.length + claims.length === 0) return previews;

  const retry = await generateValidated(
    input.provider,
    {
      system: prompt.system,
      user: `${prompt.user}\n\nYour previous answer:\n${JSON.stringify(out)}\n\n${feedback(over, claims)}`,
    },
    RewriteOutputSchema,
  );
  const retried = retry.previews.slice(0, input.command.previews);
  // Keep the retry unless it made the length problem worse.
  const retriedOver = retried.filter((p) => p.text.length > LIMITS[input.field]).length;
  return clean(retriedOver <= over.length ? retried : previews);
}
