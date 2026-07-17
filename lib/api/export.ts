import type { ExportFormat, ExportResult, Problem } from "@/domain";
import { apiClient } from "./client";

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
  const { data, error } = await apiClient.POST("/v1/export/{id}", {
    params: { path: { id: generationId } },
    body: { variationId, format },
  });

  if (error) {
    throw new ExportError(error as Problem);
  }

  return toDomainExportResult(data);
}
