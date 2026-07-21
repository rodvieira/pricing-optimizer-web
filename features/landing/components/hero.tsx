import { Button, Text } from "@astryxdesign/core";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-8 pt-16 pb-10">
      <Eyebrow tone="rust" withRule className="mb-6">
        PSYCHOLOGY-DRIVEN PRICING
      </Eyebrow>
      {/* Two-tone headline: second sentence drops to secondary, matching the mock. */}
      <Text type="display-1" as="h1" className="block max-w-3xl text-balance">
        Three pricing pages. Three strategies.{" "}
        <span className="text-secondary">Generated live from one URL.</span>
      </Text>
      {/* font-normal: Astryx's `large` text defaults to 600; the mock's subcopy is 400. */}
      <Text type="large" color="secondary" className="mt-6 block max-w-xl font-normal text-pretty">
        Paste any product URL. We scrape it, classify the audience with an LLM, and stream three
        psychology-backed pricing pages in parallel — compare side by side and export to JSX, HTML,
        or a Stripe Pricing Table.
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button label="Open the Studio →" variant="primary" size="lg" href="/studio" />
        {/* Enabled to match the mock; behavior (recorded demo / embedded player) is
            still an open product question — see issue #1. */}
        <Button label="Watch a live run" variant="secondary" size="lg" />
      </div>
    </section>
  );
}
