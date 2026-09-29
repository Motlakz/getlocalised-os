export type CommandId =
  | "native"
  | "aso"
  | "punchier"
  | "benefit"
  | "fit"
  | "shorter"
  | "simplify"
  | "formal"
  | "casual"
  | "variants"
  | "custom";

export type Command = {
  id: CommandId;
  label: string;
  description: string;
  /** What the engine asks the model to do with the field. */
  instruction: string;
  /** Seeded commands have prepared results and work without a key. */
  seeded: boolean;
  previews: number;
};

export const COMMANDS: Command[] = [
  {
    id: "native",
    label: "Sound native",
    description: "Remove anything translated-sounding",
    instruction:
      "Rewrite so a native speaker would never suspect a translation: idiomatic phrasing, natural word order, local conventions for punctuation and numbers. Keep the meaning.",
    seeded: true,
    previews: 1,
  },
  {
    id: "aso",
    label: "Search terms",
    description: "Work in the market's search phrases naturally",
    instruction:
      "Work the market's search phrases into the text where they genuinely fit, favouring the ones closest to what the app does. Never list or stuff them; the result must still read as natural copy.",
    seeded: true,
    previews: 1,
  },
  {
    id: "punchier",
    label: "Punchier",
    description: "More confident, no hype",
    instruction:
      "Make it more confident and energetic with stronger verbs and tighter rhythm. No hype words, superlatives, or claims the source doesn't make.",
    seeded: true,
    previews: 1,
  },
  {
    id: "benefit",
    label: "Lead with the benefit",
    description: "User outcome before feature",
    instruction: "Restructure so the outcome for the user comes first and the feature that delivers it follows.",
    seeded: true,
    previews: 1,
  },
  {
    id: "fit",
    label: "Fit the limit",
    description: "Cut filler until it fits",
    instruction:
      "Cut filler until the text fits comfortably within the character limit, keeping the most important words and any search phrases already present.",
    seeded: true,
    previews: 1,
  },
  {
    id: "shorter",
    label: "Shorter",
    description: "Tighten without losing the message",
    instruction: "Make it noticeably shorter without losing the core message.",
    seeded: false,
    previews: 1,
  },
  {
    id: "simplify",
    label: "Simplify",
    description: "Everyday words",
    instruction: "Use everyday words and short sentences a casual reader understands instantly.",
    seeded: false,
    previews: 1,
  },
  {
    id: "formal",
    label: "More formal",
    description: "Formal register",
    instruction: "Shift to the formal register normal for this market (for example vous, usted, Sie).",
    seeded: false,
    previews: 1,
  },
  {
    id: "casual",
    label: "More casual",
    description: "Friendly register",
    instruction: "Shift to a friendly, informal register normal for apps in this market (for example tu, tú, du).",
    seeded: false,
    previews: 1,
  },
  {
    id: "variants",
    label: "Variants",
    description: "Three alternatives",
    instruction: "Write three clearly different alternatives, each native and within the limit.",
    seeded: false,
    previews: 3,
  },
];

export const SEEDED_COMMANDS = COMMANDS.filter((c) => c.seeded);

export const CUSTOM_COMMAND: Command = {
  id: "custom",
  label: "Custom",
  description: "Your own instruction",
  instruction: "",
  seeded: false,
  previews: 1,
};

export function getCommand(id: string): Command | undefined {
  return id === "custom" ? CUSTOM_COMMAND : COMMANDS.find((c) => c.id === id);
}
