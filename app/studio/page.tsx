import { Suspense } from "react";
import { StudioPage } from "@/features/studio/studio-page";

export default function Studio() {
  // StudioPage reads `?url=` via useSearchParams (for the hero's "Watch a
  // live run" auto-run link), which requires a Suspense boundary so the
  // route can still be statically prerendered instead of failing the build.
  return (
    <Suspense>
      <StudioPage />
    </Suspense>
  );
}
