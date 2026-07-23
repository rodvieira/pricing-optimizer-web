export type Sophistication = "low" | "medium" | "high";
export type PricePosition = "budget" | "mid_market" | "premium";
export type SourceType = "spa" | "static";

export interface Audience {
  segment: string;
  sophistication: Sophistication;
  pricePosition?: PricePosition;
}

export interface SiteProfile {
  url: string;
  title: string;
  /** 1-2 sentence summary. */
  valueProposition: string;
  /** e.g. "developer-tools", "e-commerce". */
  industry: string;
  audience: Audience;
  /** Salient terms extracted from the page. */
  keywords?: string[];
  /** Which scraper handled the page. */
  sourceType: SourceType;
  analyzedAt: string;
}
