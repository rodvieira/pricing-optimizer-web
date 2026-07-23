import type { SiteProfile } from "./site-profile";
import type { Variation } from "./variation";

export type GenerationStatus = "pending" | "streaming" | "completed" | "failed";

export interface Generation {
  id: string;
  sourceUrl: string;
  siteProfile?: SiteProfile;
  status: GenerationStatus;
  variations: Variation[];
  createdAt: string;
}
