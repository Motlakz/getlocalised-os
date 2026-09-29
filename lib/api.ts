import { z } from "zod";

import { EngineError, type ErrorCode } from "./engine/providers/types";
import { FIELDS, FieldsSchema, MARKETS } from "./engine/types";

/** The visitor's key travels in this header, never in a URL or a body that could end up in logs. */
export const KEY_HEADER = "x-model-key";

const SkillInput = z.object({
  name: z.string().max(60),
  description: z.string().max(300),
  body: z.string().max(6000),
});

const Shared = {
  provider: z.enum(["gemini", "openai"]),
  market: z.enum(MARKETS),
  skills: z.array(SkillInput).max(8),
};

export const RewriteRequest = z.object({
  ...Shared,
  field: z.enum(FIELDS),
  text: z.string().min(1).max(5000),
  sourceText: z.string().max(5000),
  phrases: z.array(z.string().max(120)).max(30),
  command: z.string(),
  freeText: z.string().max(500).optional(),
});
export type RewriteRequest = z.infer<typeof RewriteRequest>;

export const LocalizeRequest = z.object({
  ...Shared,
  listing: FieldsSchema.extend({
    title: z.string().trim().min(1, "Add a title").max(200),
    short: z.string().trim().min(1, "Add a short description").max(400),
    full: z.string().trim().min(1, "Add a full description").max(8000),
  }),
});
export type LocalizeRequest = z.infer<typeof LocalizeRequest>;

export type ApiError = { error: { code: ErrorCode; message: string } };

const STATUS: Record<ErrorCode, number> = {
  bad_input: 400,
  invalid_key: 401,
  quota: 429,
  bad_output: 502,
  provider_error: 502,
};

export function errorResponse(err: unknown): Response {
  const e =
    err instanceof EngineError ? err : new EngineError("provider_error", "Something went wrong running the model. Try again.");
  return Response.json({ error: { code: e.code, message: e.message } } satisfies ApiError, { status: STATUS[e.code] });
}

/** Parses a JSON body against a schema; bad input becomes a readable EngineError. */
export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const raw = await req.json().catch(() => {
    throw new EngineError("bad_input", "The request body must be JSON.");
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new EngineError("bad_input", issue ? `${issue.path.join(".") || "body"}: ${issue.message}` : "Invalid request.");
  }
  return parsed.data;
}

export function requireKeyHeader(req: Request): string {
  const key = req.headers.get(KEY_HEADER)?.trim();
  if (!key) throw new EngineError("invalid_key", "Add your model key to run this live.");
  return key;
}
