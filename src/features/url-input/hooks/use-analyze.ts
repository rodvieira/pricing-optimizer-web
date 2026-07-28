import { useMutation } from "@tanstack/react-query";
import { type AnalyzeError, analyzeSite } from "@/shared/api/analyze";
import type { SiteProfile } from "@/shared/domain";
import { useLocaleMode } from "@/shared/i18n";

export function useAnalyze() {
  const { locale } = useLocaleMode();

  return useMutation<SiteProfile, AnalyzeError, string>({
    mutationFn: (url: string) => analyzeSite(url, locale),
  });
}
