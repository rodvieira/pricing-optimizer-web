import { z } from "zod";

/**
 * Accepts a bare domain (e.g. "flowbase.com") as well as a fully-qualified
 * URL, matching the design's "https:// [your-product.com]" input affordance.
 * Normalizes to a fully-qualified https URL before it ever reaches the API.
 */
export const urlInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Paste a product URL to get started.")
    .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
    .pipe(z.url("Invalid URL — include a valid domain like flowbase.com.")),
});

export type UrlInputValues = z.infer<typeof urlInputSchema>;
