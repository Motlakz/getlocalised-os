import { expect, test } from "bun:test";

import { initialState, playgroundReducer } from "./state";

const seed = { title: "BellyClock: Intervallfasten", short: "Kurz", full: "Lang" };

test("applying a preview replaces only that field and records the command and its notes", () => {
  const notes = [{ term: "Fasten-Tracker", why: "Common search phrase." }];
  const next = playgroundReducer(initialState(seed), {
    type: "apply",
    field: "short",
    command: "punchier",
    text: "Neu",
    notes,
  });
  expect(next.fields).toEqual({ ...seed, short: "Neu" });
  expect(next.applied).toEqual({ short: "punchier" });
  expect(next.notes.short).toEqual(notes);
});

test("dismissing the menu dispatches nothing, so the state is unchanged", () => {
  const state = initialState(seed);
  expect(state.fields).toEqual(seed);
  expect(state.applied).toEqual({});
});

test("editing a field clears nothing else; reset returns to the seed", () => {
  const edited = playgroundReducer(initialState(seed), { type: "edit", field: "title", text: "X" });
  expect(edited.fields.title).toBe("X");
  expect(playgroundReducer(edited, { type: "reset", fields: seed })).toEqual(initialState(seed));
});
