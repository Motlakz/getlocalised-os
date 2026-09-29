import { FIELDS, LIMITS, type Field, type Fields } from "../engine/types";
import { stopwords } from "./stopwords";

/** Lowercase and strip diacritics so "jeûne" matches "jeune" and "Fasten" matches "fasten". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const tokenize = (text: string) => normalize(text).match(/[\p{L}\p{N}]+/gu) ?? [];

export type LimitFinding = { field: Field; count: number; limit: number; over: boolean };

export function checkLimits(fields: Fields): LimitFinding[] {
  return FIELDS.map((field) => {
    const count = fields[field].length;
    return { field, count, limit: LIMITS[field], over: count > LIMITS[field] };
  });
}

/**
 * `exact`: the phrase appears as written (whole words) in at least one field.
 * `words`: every word of the phrase appears in one field, just not together.
 */
export type PhraseFinding = { phrase: string; status: "exact" | "words" | "none"; fields: Field[] };

export function checkPhrases(fields: Fields, phrases: string[]): PhraseFinding[] {
  return phrases.map((phrase) => {
    const words = tokenize(phrase);
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${words.join("[^\\p{L}\\p{N}]+")}($|[^\\p{L}\\p{N}])`, "u");
    const exact = FIELDS.filter((f) => words.length > 0 && pattern.test(normalize(fields[f])));
    if (exact.length) return { phrase, status: "exact", fields: exact };
    const partial = FIELDS.filter((f) => {
      const present = new Set(tokenize(fields[f]));
      return words.length > 0 && words.every((w) => present.has(w));
    });
    return { phrase, status: partial.length ? "words" : "none", fields: partial };
  });
}

export type RepetitionFinding = { word: string; count: number; where: "title+short" | "full" };

/** Content words used too often: twice across title + short, or four times in the full description. */
export function checkRepetition(fields: Fields, lang: string, ignore: string[] = []): RepetitionFinding[] {
  const skip = new Set([...stopwords(lang), ...ignore.flatMap(tokenize)]);
  const count = (text: string) => {
    const counts = new Map<string, number>();
    for (const w of tokenize(text)) if (w.length >= 4 && !skip.has(w) && !/^\d+$/.test(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
    return counts;
  };
  const out: RepetitionFinding[] = [];
  for (const [word, n] of count(`${fields.title} ${fields.short}`)) if (n >= 2) out.push({ word, count: n, where: "title+short" });
  for (const [word, n] of count(fields.full)) if (n >= 4) out.push({ word, count: n, where: "full" });
  return out.sort((a, b) => b.count - a.count);
}

export type Findings = {
  limits: LimitFinding[];
  phrases: PhraseFinding[];
  repetition: RepetitionFinding[];
};

export function analyze(fields: Fields, phrases: string[], lang: string, ignore: string[] = []): Findings {
  return {
    limits: checkLimits(fields),
    phrases: checkPhrases(fields, phrases),
    repetition: checkRepetition(fields, lang, ignore),
  };
}
