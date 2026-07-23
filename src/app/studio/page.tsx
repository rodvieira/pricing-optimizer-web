import { StudioPage } from "@/views/studio/studio-page";

export default function Studio() {
  // StudioPage's own <StudioAutoRun> (features/studio/components/) owns the
  // one useSearchParams() read (for the hero's "Watch a live run" ?url=
  // link) and its own <Suspense> boundary — kept out of this route
  // component so the static shell here isn't gated behind it. See
  // studio-auto-run.tsx for why (issue #5).
  return <StudioPage />;
}
