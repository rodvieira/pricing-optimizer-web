import type { Generation, Problem } from "@/domain";
import { apiClient } from "./client";

export class GetGenerationError extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.detail ?? problem.title);
  }
}

export async function getGeneration(id: string): Promise<Generation> {
  const { data, error } = await apiClient.GET("/v1/generations/{id}", {
    params: { path: { id } },
  });

  if (error) {
    throw new GetGenerationError(error as Problem);
  }

  return data;
}
