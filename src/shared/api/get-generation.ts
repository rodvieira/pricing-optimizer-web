import type { Generation, Problem } from "@/shared/domain";
import { apiClient } from "./client";
import { networkFailureProblem } from "./network-error";

export class GetGenerationError extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.detail ?? problem.title);
  }
}

export async function getGeneration(id: string): Promise<Generation> {
  let data: Generation | undefined;
  let error: Problem | undefined;

  try {
    ({ data, error } = await apiClient.GET("/v1/generations/{id}", { params: { path: { id } } }));
  } catch (err) {
    throw new GetGenerationError(networkFailureProblem(err));
  }

  if (error) {
    throw new GetGenerationError(error);
  }

  return data as Generation;
}
