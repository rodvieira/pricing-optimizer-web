import { describe, expect, it } from "vitest";
import { strategyMeta } from "./strategy-meta";

describe("strategyMeta", () => {
  it("returns the matching entry for a known strategy", () => {
    expect(strategyMeta("freemium").label).toBe("Freemium ladder");
  });

  it("throws for a strategy outside the known set", () => {
    // @ts-expect-error deliberately exercising the not-found branch
    expect(() => strategyMeta("nonexistent")).toThrow("Unknown pricing strategy: nonexistent");
  });
});
