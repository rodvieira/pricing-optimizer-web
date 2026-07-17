import type { Problem } from "@/domain";

/**
 * openapi-fetch's `{ data, error }` result only covers HTTP responses the
 * server actually sent back. A connection failure (backend down, DNS
 * failure, timeout) makes the underlying `fetch()` throw instead — this
 * normalizes that into the same `Problem` shape so callers don't have to
 * distinguish "the server said no" from "we never reached the server".
 */
export function networkFailureProblem(err: unknown): Problem {
  return {
    type: "about:blank",
    title: "Backend unreachable",
    status: 0,
    detail: err instanceof Error ? err.message : "The request failed before reaching the server.",
  };
}
