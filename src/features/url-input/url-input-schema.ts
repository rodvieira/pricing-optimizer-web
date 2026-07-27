import { z } from "zod";

/**
 * Matches an optional `http(s)://` prefix followed by a domain-shaped host
 * (labels of alphanumerics/hyphens, at least one dot, no whitespace) and an
 * optional path/port. Deliberately not delegating this check to `z.url()`
 * alone: `z.url()` validates via the runtime's native `URL` constructor,
 * and Chromium's implementation is more lenient than Node's — e.g.
 * `new URL("https://not a url")` throws in Node but silently
 * percent-encodes the spaces into a "valid" URL in Chromium. That leniency
 * let invalid input reach the network in the browser despite this schema
 * passing in Node-based tests. A plain string regex behaves identically in
 * both environments.
 */
const DOMAIN_URL_PATTERN =
  /^(https?:\/\/)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

/**
 * Accepts a bare domain (e.g. "flowbase.com") as well as a fully-qualified
 * URL, matching the design's "https:// [your-product.com]" input affordance.
 * Normalizes to a fully-qualified https URL before it ever reaches the API.
 *
 * Validation messages are keys into the `urlInput` message-catalog
 * namespace, not display text — this schema is a module-level constant, not
 * locale-aware itself (consistent with `shared/domain/`'s purity rule
 * elsewhere in this repo). `url-input-form.tsx` resolves the key through
 * `useTranslations("urlInput")` before rendering it — bare keys here
 * (`"required"`, not `"urlInput.required"`), since that hook is already
 * namespaced to `urlInput`.
 */
export const urlInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "required")
    .refine((value) => DOMAIN_URL_PATTERN.test(value), "invalid")
    .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`)),
});

export type UrlInputValues = z.infer<typeof urlInputSchema>;
