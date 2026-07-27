import type { CSSProperties } from "react";
import { Button, Eyebrow, Text } from "@/shared/ui";

// The mock's hero CTAs measure 24px horizontal padding at 15px type, wider
// than Button's own `lg` size — overridden locally via inline style.
const HERO_BUTTON_STYLE = {
  paddingInline: "24px",
  fontSize: "15px",
} as CSSProperties;

// "Watch a live run" jumps straight into the Studio with this example
// already analyzing, so a visitor sees the real product move without typing
// anything first.
const LIVE_RUN_EXAMPLE_URL = "linear.app";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-16 pb-10 sm:px-8">
      <Eyebrow tone="rust" withRule className="mb-6">
        PSYCHOLOGY-DRIVEN PRICING
      </Eyebrow>
      {/* Two-tone headline: second sentence drops to secondary, matching the
          mock. Font-size/tracking scale down gradually below the mock's
          native 60px/-2.1px so the two lines fit a narrow viewport without
          wrapping onto four or five lines. */}
      <Text
        type="display-1"
        as="h1"
        className="block text-[32px] tracking-[-1.1px] text-balance sm:text-[42px] sm:tracking-[-1.4px] lg:text-[60px] lg:tracking-[-2.1px]"
      >
        Three pricing pages. Three strategies.
        <br />
        <span className="text-secondary">Generated live from one URL.</span>
      </Text>
      {/* font-normal: the `large` Text type defaults to 600; the mock's subcopy is 400. */}
      <Text
        type="large"
        color="secondary"
        className="mt-6 block max-w-xl text-[15px] font-normal text-pretty sm:text-[16px] lg:text-[17px]"
      >
        Paste any product URL. We scrape it, classify the audience with an LLM, and stream three
        psychology-backed pricing pages in parallel — compare side by side and export to JSX, HTML,
        or a Stripe Pricing Table.
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          label="Open the Studio →"
          variant="primary"
          size="lg"
          href="/studio"
          style={HERO_BUTTON_STYLE}
        />
        <Button
          label="Watch a live run"
          variant="secondary"
          size="lg"
          href={`/studio?url=${LIVE_RUN_EXAMPLE_URL}`}
          style={HERO_BUTTON_STYLE}
        />
      </div>
    </section>
  );
}
