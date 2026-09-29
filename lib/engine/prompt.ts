import type { Command } from "./commands";
import { FIELD_LABELS, LIMITS, MARKET_INFO, type Field, type Fields, type Market, type Skill } from "./types";

function skillsBlock(skills: Skill[]): string {
  if (skills.length === 0) return "(no skills provided)";
  return skills.map((s) => `### Skill: ${s.name}\n${s.description}\n\n${s.body.trim()}`).join("\n\n");
}

function phrasesBlock(phrases: string[]): string {
  return phrases.length ? phrases.map((p) => `- ${p}`).join("\n") : "(none captured)";
}

function listingBlock(fields: Fields): string {
  return (Object.keys(FIELD_LABELS) as Field[])
    .map((f) => `${FIELD_LABELS[f]} (max ${LIMITS[f]} characters):\n${fields[f]}`)
    .join("\n\n");
}

function system(market: Market, skills: Skill[]): string {
  const { language, country } = MARKET_INFO[market];
  return `You write Google Play store listings natively in ${language} for people in ${country}.

A native listing is not a translation. Keep the source's meaning, promises and facts, but write it the way a ${language}-speaking copywriter in ${country} would have written it from scratch: idiomatic phrasing, the words people there actually use and search for, and local conventions.

Rules:
- Never invent features, prices, numbers or claims that the source does not make. No medical, financial or guaranteed-result claims beyond the source.
- No superlatives ("best", "#1", "top") and no calls to action in the title.
- Use the market's search phrases where they fit naturally, especially in the title and short description. Never stuff or list them.
- Search phrases are typed by users and are often missing accents or capitals. Always write them with correct spelling, accents and capitalisation in the listing (for example \"jeune intermittent\" is written \"jeûne intermittent\").
- Stay strictly within each field's character limit. Count characters, including spaces.
- Keep the source's line breaks and bullet structure in the full description where it helps.
- Follow the developer's skills below. They describe the brand, the audience and the store rules, and they override your defaults.
- "notes" and "why" explanations are always written in English, one sentence each.

The developer's skills:

${skillsBlock(skills)}`;
}

export function localizePrompt(input: {
  source: Fields;
  market: Market;
  skills: Skill[];
  phrases: string[];
}): { system: string; user: string } {
  return {
    system: system(input.market, input.skills),
    user: `Search phrases people use on Google Play in this market:
${phrasesBlock(input.phrases)}

The English source listing:

${listingBlock(input.source)}

Write the native listing for all three fields. Then add 3 to 6 notes on the most important word choices: which native term you chose and why it suits this market (for example that it matches a search phrase, or that the literal translation would sound unnatural).`,
  };
}

export function rewritePrompt(input: {
  field: Field;
  text: string;
  sourceText: string;
  market: Market;
  skills: Skill[];
  phrases: string[];
  command: Command;
  freeText?: string;
}): { system: string; user: string } {
  const instruction = input.command.id === "custom" ? (input.freeText ?? "").trim() : input.command.instruction;
  const count = input.command.previews;
  return {
    system: system(input.market, input.skills),
    user: `Search phrases people use on Google Play in this market:
${phrasesBlock(input.phrases)}

Field: ${FIELD_LABELS[input.field]} (max ${LIMITS[input.field]} characters)

English source of this field:
${input.sourceText}

Current native text:
${input.text}

Instruction: ${instruction}

Return ${count === 1 ? "one rewritten version" : `${count} different rewritten versions`} of the current native text, each within ${LIMITS[input.field]} characters, with 1 to 3 notes each on the key word choices.`,
  };
}

/** A follow-up asking the model to fix fields that broke their limits. */
export function tooLongFeedback(over: { field: Field; length: number }[]): string {
  return `Your previous answer broke the character limits: ${over
    .map((o) => `${FIELD_LABELS[o.field]} was ${o.length} characters (max ${LIMITS[o.field]})`)
    .join("; ")}. Return the full answer again with those fields shortened to fit, keeping everything else.`;
}
