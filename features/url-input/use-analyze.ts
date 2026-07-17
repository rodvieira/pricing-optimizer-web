import { useMutation } from "@tanstack/react-query";
import type { SiteProfile } from "@/domain";
import { type AnalyzeError, analyzeSite } from "@/lib/api/analyze";

export function useAnalyze() {
  return useMutation<SiteProfile, AnalyzeError, string>({
    mutationFn: (url: string) => analyzeSite(url),
  });
}
