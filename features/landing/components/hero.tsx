import { Button, Text } from "@astryxdesign/core";
import type { CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

// Astryx's `lg` button token is 36px tall with 12px horizontal padding at
// 14px type; the mock's hero CTAs measure 47px tall, 24px horizontal padding,
// 15px type. Overridden locally via the same CSS custom property/properties
// Button's box model binds to, rather than fighting StyleX's atomic class
// specificity with Tailwind utilities.
const HERO_BUTTON_STYLE = {
  "--size-element-lg": "47px",
  paddingInline: "24px",
  fontSize: "15px",
} as CSSProperties;

// "Watch a live run" jumps straight into the Studio with this example
// already analyzing, so a visitor sees the real product move without typing
// anything first.
const LIVE_RUN_EXAMPLE_URL = "stripe.com";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-7xl px-8 pt-16 pb-10">
      <Eyebrow tone="rust" withRule className="mb-6">
        PSYCHOLOGY-DRIVEN PRICING
      </Eyebrow>
      {/* Two-tone headline: second sentence drops to secondary, matching the mock. */}
      <Text type="display-1" as="h1" className="block text-balance">
        Three pricing pages. Three strategies.
        <br />
        <span className="text-secondary">Generated live from one URL.</span>
      </Text>
      {/* font-normal: Astryx's `large` text defaults to 600; the mock's subcopy is 400. */}
      <Text type="large" color="secondary" className="mt-6 block max-w-xl font-normal text-pretty">
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
