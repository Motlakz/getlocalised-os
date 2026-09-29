import type { CommandId } from "@/lib/engine/commands";
import type { Field, Fields, Note } from "@/lib/engine/types";

/** What the Playground holds in memory for one app × market. Reload returns to the seed. */
export type PlaygroundState = {
  fields: Fields;
  /** The command last applied to each field, for the "applied" label. */
  applied: Partial<Record<Field, CommandId>>;
  /** Notes from applied previews, shown with the base notes under "Why these terms". */
  notes: Partial<Record<Field, Note[]>>;
};

export type PlaygroundAction =
  | { type: "edit"; field: Field; text: string }
  | { type: "apply"; field: Field; command: CommandId; text: string; notes: Note[] }
  | { type: "reset"; fields: Fields };

export const initialState = (fields: Fields): PlaygroundState => ({ fields, applied: {}, notes: {} });

export function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case "edit":
      return { ...state, fields: { ...state.fields, [action.field]: action.text } };
    case "apply":
      return {
        fields: { ...state.fields, [action.field]: action.text },
        applied: { ...state.applied, [action.field]: action.command },
        notes: { ...state.notes, [action.field]: action.notes },
      };
    case "reset":
      return initialState(action.fields);
  }
}
