import { describe, expect, test } from "bun:test";

import { analyze, checkLimits, checkPhrases, checkRepetition } from "./index";

const fields = {
  title: "BellyClock: Intervallfasten",
  short: "Dein Fasten Tracker für Intervallfasten und Wasserfasten.",
  full: "Fasten leicht gemacht. Fasten mit Timer. Fasten mit Plan. Fasten ohne Stress. Jeûne und Tracker.",
};

describe("checkLimits", () => {
  test("counts characters and flags fields over the Play limit", () => {
    const [title, short] = checkLimits({ ...fields, short: "x".repeat(81) });
    expect(title).toEqual({ field: "title", count: 27, limit: 30, over: false });
    expect(short.over).toBe(true);
  });
});

describe("checkPhrases", () => {
  test("finds exact phrases case-insensitively and reports every field that has them", () => {
    const [f] = checkPhrases(fields, ["intervallfasten"]);
    expect(f.status).toBe("exact");
    expect(f.fields).toEqual(["title", "short"]);
  });

  test("matches whole words only", () => {
    expect(checkPhrases(fields, ["fast"])[0].status).toBe("none");
  });

  test("ignores diacritics", () => {
    expect(checkPhrases(fields, ["jeune"])[0].status).toBe("exact");
  });

  test("reports words present but not together", () => {
    const [f] = checkPhrases(fields, ["tracker fasten"]);
    expect(f.status).toBe("words");
    expect(f.fields).toContain("short");
  });
});

describe("checkRepetition", () => {
  test("flags a content word used four times in the full description", () => {
    const rep = checkRepetition(fields, "de");
    expect(rep).toContainEqual({ word: "fasten", count: 4, where: "full" });
  });

  test("ignores stopwords and the app name", () => {
    const rep = checkRepetition(
      { title: "BellyClock für dich", short: "BellyClock für dich und dich", full: "ok" },
      "de",
      ["BellyClock"],
    );
    expect(rep).toEqual([]);
  });

  test("flags a word used twice across title and short", () => {
    const rep = checkRepetition(fields, "de");
    expect(rep).toContainEqual({ word: "intervallfasten", count: 2, where: "title+short" });
  });
});

test("analyze returns all three kinds of findings", () => {
  const f = analyze(fields, ["intervallfasten"], "de", ["BellyClock"]);
  expect(f.limits).toHaveLength(3);
  expect(f.phrases).toHaveLength(1);
  expect(f.repetition.length).toBeGreaterThan(0);
});
