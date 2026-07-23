/** RFC 7807 problem details, as returned by every backend error response. */
export interface Problem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Correlation id for logs/traces. */
  traceId?: string;
}
