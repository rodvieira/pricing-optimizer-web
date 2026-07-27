"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "@/shared/ui";

/**
 * Thin mono ribbon between the header and hero, matching the mock: a product
 * label on the left and the positioning tagline on the right, in muted warm
 * gray with a hairline bottom rule. Hidden on mobile — it's redundant with
 * the header's own wordmark at that width and just adds another row before
 * the hero.
 */
export function TopRibbon() {
  const t = useTranslations("landing");

  return (
    <div className="hidden sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-border px-6 py-3 sm:px-8">
        {/* Brand name, not translated — same wordmark convention as AppHeader. */}
        <Eyebrow tone="muted">PRICING OPTIMIZER</Eyebrow>
        <Eyebrow tone="muted">{t("ribbonTagline")}</Eyebrow>
      </div>
    </div>
  );
}
