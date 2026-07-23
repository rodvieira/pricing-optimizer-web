import type { Problem, SiteProfile } from "@/shared/domain";
import { apiClient } from "./client";
import { networkFailureProblem } from "./network-error";

export class AnalyzeError extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.detail ?? problem.title);
  }
}

function toDomainSiteProfile(wire: SiteProfile): SiteProfile {
  return wire;
}

export async function analyzeSite(url: string): Promise<SiteProfile> {
  let data: SiteProfile | undefined;
  let error: Problem | undefined;

  try {
    ({ data, error } = await apiClient.POST("/v1/analyze", { body: { url } }));
  } catch (err) {
    throw new AnalyzeError(networkFailureProblem(err));
  }

  if (error) {
    throw new AnalyzeError(error);
  }

  return toDomainSiteProfile(data as SiteProfile);
}
