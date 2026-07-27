import { describe, expect, it } from "vitest";
import type { Problem } from "@/shared/domain";
import { problemMessageKey } from "./problem-message";

function problem(status: number): Problem {
  return { title: "irrelevant for this mapping", status };
}

describe("problemMessageKey", () => {
  it.each([
    [0, "network"],
    [400, "status400"],
    [404, "status404"],
    [409, "status409"],
    [422, "status422"],
    [429, "status429"],
    [500, "status500"],
    [502, "status502"],
  ])("maps status %i to %s", (status, expectedKey) => {
    expect(problemMessageKey(problem(status))).toBe(expectedKey);
  });

  it("falls back to the generic key for an unmapped status", () => {
    expect(problemMessageKey(problem(418))).toBe("generic");
  });

  it("ignores Problem.type entirely — the backend never populates it (see ADR-0019)", () => {
    const withType: Problem = { title: "x", status: 400, type: "https://example.com/some-type" };
    expect(problemMessageKey(withType)).toBe("status400");
  });
});
