import { Button, Text } from "@astryxdesign/core";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-8 pt-16 pb-10">
      <div className="mb-6 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent">
        <span aria-hidden className="h-px w-6 bg-accent" />
        <span>PSYCHOLOGY-DRIVEN PRICING</span>
      </div>
      <Text type="display-1" as="h1" className="block max-w-3xl text-balance">
        Three pricing pages. Three strategies. Generated live from one URL.
      </Text>
      <Text type="large" color="secondary" className="mt-6 block max-w-xl text-pretty">
        Paste any product URL. We scrape it, classify the audience with an LLM, and stream three
        psychology-backed pricing pages in parallel — compare side by side and export to JSX, HTML,
        or a Stripe Pricing Table.
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button label="Open the Studio" variant="primary" size="lg" href="/studio" />
      </div>
    </section>
  );
}
