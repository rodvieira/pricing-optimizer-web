import { Card } from "@astryxdesign/core";
import { ColorAccentColumn } from "@/components/ui/color-accent-column";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PanelHeader } from "@/components/ui/panel-header";
import { PriceDisplay } from "@/components/ui/price-display";

const PREVIEW_CARDS = [
  { label: "ANCHOR", price: "$49", hint: " /mo", variant: "orange" as const },
  { label: "FREEMIUM", price: "$0", hint: " free", variant: "teal" as const },
  { label: "VALUE", price: "$79", hint: " /mo", variant: "pink" as const },
];

export function ProductPreview() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <Card variant="default" padding={0}>
        <PanelHeader>
          <div className="flex gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-border-strong" />
          </div>
          <div className="mx-auto max-w-xs flex-1 rounded-md bg-muted px-3 py-1 text-center font-mono text-xs text-primary">
            flowbase.com
          </div>
        </PanelHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {PREVIEW_CARDS.map((card) => (
            <ColorAccentColumn key={card.label} color={card.variant} className="px-5 py-5">
              <div className="mb-3 flex items-center gap-2">
                <Eyebrow>{card.label}</Eyebrow>
                <span aria-hidden className="ml-auto text-success">
                  ✓
                </span>
              </div>
              <PriceDisplay amount={card.price} period={card.hint} />
            </ColorAccentColumn>
          ))}
        </div>
      </Card>
    </section>
  );
}
