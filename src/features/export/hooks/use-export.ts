import { useQuery } from "@tanstack/react-query";
import { exportVariation } from "@/shared/api/export";
import type { ExportFormat } from "@/shared/domain";

export function useExport(
  generationId: string | null,
  variationId: string | null,
  format: ExportFormat,
) {
  return useQuery({
    queryKey: ["export", generationId, variationId, format],
    queryFn: () => exportVariation(generationId as string, variationId as string, format),
    enabled: generationId != null && variationId != null,
  });
}
