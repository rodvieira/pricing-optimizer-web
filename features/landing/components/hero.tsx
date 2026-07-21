import { Button, Text } from "@astryxdesign/core";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Eyebrow tone="accent" withRule className="mb-6">
        PSYCHOLOGY-DRIVEN PRICING
      </Eyebrow>
      <Text type="display-1" as="h1" className="block max-w-3xl text-balance">
        Three pricing pages. Three strategies. Generated live from one URL.
      </Text>
      <Text type="large" color="secondary" className="mt-6 block max-w-xl text-pretty">
        Paste any product URL. We scrape it, classify the audience with an LLM, and stream three
        psychology-backed pricing pages in parallel — compare side by side and export to JSX, HTML,
        or a Stripe Pricing Table.
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button label="Open the Studio →" variant="primary" size="lg" href="/studio" />
        {/* Disabled until "watch a live run" has a defined destination (recorded demo, embedded player, etc.) — same open-question pattern as "Edit inline", see issue #1. */}
        <Button label="Watch a live run" variant="secondary" size="lg" isDisabled />
      </div>
    </section>
  );
}
