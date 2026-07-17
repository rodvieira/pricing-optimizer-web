import type { Problem, SiteProfile } from "@/domain";
import { apiClient } from "./client";

export class AnalyzeError extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.detail ?? problem.title);
  }
}

function toDomainSiteProfile(wire: SiteProfile): SiteProfile {
  return wire;
}

export async function analyzeSite(url: string): Promise<SiteProfile> {
  const { data, error } = await apiClient.POST("/v1/analyze", {
    body: { url },
  });

  if (error) {
    throw new AnalyzeError(error as Problem);
  }

  return toDomainSiteProfile(data);
}
