import { describe, expect, it } from "vitest";
import { urlInputSchema } from "@/features/url-input/url-input-schema";

describe("urlInputSchema", () => {
  it("accepts a bare domain and normalizes it to https", () => {
    const result = urlInputSchema.safeParse({ url: "flowbase.com" });
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe("https://flowbase.com");
  });

  it("accepts an already-qualified https URL unchanged", () => {
    const result = urlInputSchema.safeParse({ url: "https://flowbase.com/pricing" });
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe("https://flowbase.com/pricing");
  });

  it("rejects an empty string", () => {
    expect(urlInputSchema.safeParse({ url: "" }).success).toBe(false);
  });

  it("rejects a string with no domain shape, even with whitespace a lenient URL parser would tolerate", () => {
    // Regression: Chromium's URL constructor accepts "https://not a url" by
    // percent-encoding the spaces (`new URL("https://not a url").href` ===
    // "https://not%20a%20url/"), while Node's throws — z.url() alone let
    // this reach the network in the browser despite passing in Node tests.
    const result = urlInputSchema.safeParse({ url: "not a url" });
    expect(result.success).toBe(false);
  });

  it("rejects a string with spaces even when prefixed with a scheme", () => {
    const result = urlInputSchema.safeParse({ url: "https://not a url" });
    expect(result.success).toBe(false);
  });
});
