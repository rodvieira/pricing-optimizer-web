import type { Problem } from "@/shared/domain";

/**
 * Maps a `Problem`'s HTTP status to an `errors.*` message-catalog key, not
 * `Problem.type` — the backend never populates `type` (confirmed by reading
 * every `writeProblem(...)` call site in `pricing-optimizer-api`'s
 * `internal/adapter/httpapi/`; see ADR-0019 and specs/004-pt-br-localization/
 * research.md R4). `status: 0` is this app's own client-synthesized value for
 * a connection failure (`networkFailureProblem`), not something the backend
 * ever sends.
 */
const STATUS_MESSAGE_KEY: Record<number, string> = {
  0: "network",
  400: "status400",
  404: "status404",
  409: "status409",
  422: "status422",
  429: "status429",
  500: "status500",
  502: "status502",
};

/** Falls back to `errors.generic` for any status not explicitly mapped above. */
export function problemMessageKey(problem: Problem): string {
  return STATUS_MESSAGE_KEY[problem.status] ?? "generic";
}
