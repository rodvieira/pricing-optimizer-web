import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class values", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities in favor of the later one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("lets a caller override a base class via the last argument", () => {
    expect(cn("text-sm text-secondary", "text-primary")).toBe("text-sm text-primary");
  });
});
