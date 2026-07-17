export type ExportFormat = "jsx" | "html" | "stripe";

export interface ExportResult {
  format: ExportFormat;
  /** Suggested filename, e.g. "PricingSection.tsx". */
  filename: string;
  contentType: string;
  /** The JSX/HTML/Stripe-JSON as text. */
  content: string;
}
