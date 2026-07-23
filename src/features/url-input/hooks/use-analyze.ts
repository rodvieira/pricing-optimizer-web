import { useMutation } from "@tanstack/react-query";
import { type AnalyzeError, analyzeSite } from "@/shared/api/analyze";
import type { SiteProfile } from "@/shared/domain";

export function useAnalyze() {
  return useMutation<SiteProfile, AnalyzeError, string>({
    mutationFn: (url: string) => analyzeSite(url),
  });
}
