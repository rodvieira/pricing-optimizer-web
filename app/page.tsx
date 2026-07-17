import { Button, Card, Text } from "@astryxdesign/core";
import { STRATEGY_META } from "@/features/generate-stream/strategy-meta";

const PREVIEW_CARDS = [
  { label: "ANCHOR", price: "$49", hint: "/mo", variant: "orange" as const },
  { label: "FREEMIUM", price: "$0", hint: "free", variant: "teal" as const },
  { label: "VALUE", price: "$79", hint: "/mo", variant: "pink" as const },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-6 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent">
          <span aria-hidden className="h-px w-6 bg-accent" />
          <span>PSYCHOLOGY-DRIVEN PRICING</span>
        </div>
        <Text type="display-1" as="h1" className="max-w-3xl text-balance">
          Three pricing pages. Three strategies. Generated live from one URL.
        </Text>
        <Text type="large" color="secondary" className="mt-6 max-w-xl text-pretty">
          Paste any product URL. We scrape it, classify the audience with an LLM, and stream three
          psychology-backed pricing pages in parallel — compare side by side and export to JSX,
          HTML, or a Stripe Pricing Table.
        </Text>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button label="Open the Studio" variant="primary" size="lg" href="/studio" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <Card variant="default" padding={0}>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
              <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
              <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
            </div>
            <div className="mx-auto max-w-xs flex-1 rounded-md bg-muted px-3 py-1 text-center font-mono text-xs text-disabled">
              flowbase.com
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {PREVIEW_CARDS.map((card) => (
              <div
                key={card.label}
                className="border-t-2 border-l border-border px-5 py-5 first:border-l-0"
                style={{ borderTopColor: `var(--color-icon-${card.variant})` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-wide text-secondary">
                    {card.label}
                  </span>
                  <span aria-hidden className="ml-auto text-success">
                    ✓
                  </span>
                </div>
                <div className="font-heading text-2xl font-semibold tracking-tight">
                  {card.price}
                  <span className="font-sans text-xs font-normal text-disabled"> {card.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 px-6 py-16 sm:grid-cols-3">
        {STRATEGY_META.map((meta, index) => (
          <div
            key={meta.strategy}
            className="border-t-2 border-l border-border px-6 pt-5 first:border-l-0"
            style={{ borderTopColor: `var(--color-icon-${meta.variant})` }}
          >
            <div
              className="mb-2 font-mono text-xs tracking-wide"
              style={{ color: `var(--color-icon-${meta.variant})` }}
            >
              {String(index + 1).padStart(2, "0")} · {meta.label}
            </div>
            <p className="max-w-[30ch] text-sm leading-relaxed text-secondary text-pretty">
              {meta.blurb}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
