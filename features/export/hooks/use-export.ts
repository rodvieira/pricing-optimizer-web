import { useQuery } from "@tanstack/react-query";
import type { ExportFormat } from "@/domain";
import { exportVariation } from "@/lib/api/export";

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
