import { z } from "zod";

export const FIELDS = ["title", "short", "full"] as const;
export type Field = (typeof FIELDS)[number];

/** Google Play character limits per listing field. */
export const LIMITS: Record<Field, number> = { title: 30, short: 80, full: 4000 };

export const FIELD_LABELS: Record<Field, string> = {
  title: "Title",
  short: "Short description",
  full: "Full description",
};

export const MARKETS = ["fr-FR", "es-ES", "de-DE"] as const;
export type Market = (typeof MARKETS)[number];

export const MARKET_INFO: Record<Market, { language: string; country: string; lang: string; gl: string }> = {
  "fr-FR": { language: "French", country: "France", lang: "fr", gl: "fr" },
  "es-ES": { language: "Spanish", country: "Spain", lang: "es", gl: "es" },
  "de-DE": { language: "German", country: "Germany", lang: "de", gl: "de" },
};

export const FieldsSchema = z.object({
  title: z.string().min(1),
  short: z.string().min(1),
  full: z.string().min(1),
});
export type Fields = z.infer<typeof FieldsSchema>;

export const NoteSchema = z.object({
  term: z.string().describe("The word or phrase chosen in the native listing"),
  why: z.string().describe("One sentence, in English, on why this term suits this market"),
});
export type Note = z.infer<typeof NoteSchema>;

export const PreviewSchema = z.object({
  text: z.string().min(1),
  notes: z.array(NoteSchema),
});
export type Preview = z.infer<typeof PreviewSchema>;

export const GeneratedWithSchema = z.object({
  provider: z.enum(["gemini", "openai"]),
  model: z.string(),
  at: z.string(),
});
export type GeneratedWith = z.infer<typeof GeneratedWithSchema>;

/** `data/examples/<app>/listing.json` — the real English source listing. */
export const ListingFileSchema = z.object({
  app: z.string(),
  appId: z.string(),
  name: z.string(),
  category: z.string(),
  sourceLocale: z.literal("en-US"),
  fields: FieldsSchema,
  capturedAt: z.string(),
  skills: z.array(z.string()),
});
export type ListingFile = z.infer<typeof ListingFileSchema>;

export const PhrasesSchema = z.object({
  items: z.array(z.string()),
  source: z.string(),
  capturedAt: z.string(),
});
export type Phrases = z.infer<typeof PhrasesSchema>;

export const FieldPreviewsSchema = z.object({
  title: PreviewSchema.optional(),
  short: PreviewSchema.optional(),
  full: PreviewSchema.optional(),
});

/** `data/examples/<app>/<market>.json` — phrases, native listing and seeded command results. */
export const MarketFileSchema = z.object({
  market: z.enum(MARKETS),
  phrases: PhrasesSchema,
  native: z.object({ fields: FieldsSchema, notes: z.array(NoteSchema) }).optional(),
  commands: z.record(z.string(), FieldPreviewsSchema).default({}),
  generatedWith: GeneratedWithSchema.optional(),
});
export type MarketFile = z.infer<typeof MarketFileSchema>;

export type Skill = { name: string; description: string; body: string };

/** What the model returns for a full listing. */
export const LocalizeOutputSchema = z.object({
  fields: FieldsSchema,
  notes: z.array(NoteSchema).describe("3 to 6 notes on the most important word choices"),
});
export type LocalizeOutput = z.infer<typeof LocalizeOutputSchema>;

/** What the model returns for one field rewritten by a command. */
export const RewriteOutputSchema = z.object({
  previews: z.array(PreviewSchema).min(1),
});
export type RewriteOutput = z.infer<typeof RewriteOutputSchema>;
