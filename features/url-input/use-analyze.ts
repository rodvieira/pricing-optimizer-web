import { useMutation } from "@tanstack/react-query";
import { analyzeSite } from "@/lib/api/analyze";

export function useAnalyze() {
  return useMutation({
    mutationFn: (url: string) => analyzeSite(url),
  });
}
