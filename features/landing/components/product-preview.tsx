import { Card } from "@astryxdesign/core";

const PREVIEW_CARDS = [
  { label: "ANCHOR", price: "$49", hint: "/mo", variant: "orange" as const },
  { label: "FREEMIUM", price: "$0", hint: "free", variant: "teal" as const },
  { label: "VALUE", price: "$79", hint: "/mo", variant: "pink" as const },
];

export function ProductPreview() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <Card variant="default" padding={0}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
          </div>
          <div className="mx-auto max-w-xs flex-1 rounded-md bg-muted px-3 py-1 text-center font-mono text-xs text-primary">
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
                <span className="font-sans text-xs font-normal text-secondary"> {card.hint}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
