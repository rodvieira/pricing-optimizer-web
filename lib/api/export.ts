import type { ExportFormat, ExportResult, Problem } from "@/domain";
import { apiClient } from "./client";
import { networkFailureProblem } from "./network-error";

export class ExportError extends Error {
  constructor(public readonly problem: Problem) {
    super(problem.detail ?? problem.title);
  }
}

function toDomainExportResult(wire: ExportResult): ExportResult {
  return wire;
}

export async function exportVariation(
  generationId: string,
  variationId: string,
  format: ExportFormat,
): Promise<ExportResult> {
  let data: ExportResult | undefined;
  let error: Problem | undefined;

  try {
    ({ data, error } = await apiClient.POST("/v1/export/{id}", {
      params: { path: { id: generationId } },
      body: { variationId, format },
    }));
  } catch (err) {
    throw new ExportError(networkFailureProblem(err));
  }

  if (error) {
    throw new ExportError(error);
  }

  return toDomainExportResult(data as ExportResult);
}
