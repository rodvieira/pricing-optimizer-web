import { describe, expect, it } from "vitest";
import { networkFailureProblem } from "./network-error";

describe("networkFailureProblem", () => {
  it("uses the Error's message as the detail", () => {
    const problem = networkFailureProblem(new TypeError("fetch failed"));
    expect(problem).toEqual({
      type: "about:blank",
      title: "Backend unreachable",
      status: 0,
      detail: "fetch failed",
    });
  });

  it("falls back to a generic detail for a non-Error throw", () => {
    const problem = networkFailureProblem("some string thrown");
    expect(problem.detail).toBe("The request failed before reaching the server.");
  });
});
