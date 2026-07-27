"use client";

import { useTranslations } from "next-intl";
import { Card, ColorAccentColumn, Eyebrow, PanelHeader, PriceDisplay } from "@/shared/ui";

const PREVIEW_CARDS = [
  { id: "anchor", variant: "orange" as const },
  { id: "freemium", variant: "teal" as const },
  { id: "value", variant: "pink" as const },
];

export function ProductPreview() {
  const t = useTranslations("landing.preview");

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8">
      <Card>
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
            <ColorAccentColumn key={card.id} color={card.variant} className="px-5 py-5">
              <div className="mb-3 flex items-center gap-2">
                <Eyebrow>{t(`${card.id}.label`)}</Eyebrow>
                <span aria-hidden className="ml-auto text-xs text-success">
                  ✓
                </span>
              </div>
              <PriceDisplay amount={t(`${card.id}.price`)} period={t(`${card.id}.hint`)} />
              {/* Static placeholder bars, matching the mock's "content loading" preview. */}
              <div aria-hidden className="mt-4 flex flex-col gap-2">
                <span className="h-1.5 w-[68%] rounded-full bg-border" />
                <span className="h-1.5 w-[84%] rounded-full bg-border" />
                <span className="h-1.5 w-[52%] rounded-full bg-border" />
              </div>
            </ColorAccentColumn>
          ))}
        </div>
      </Card>
    </section>
  );
}
