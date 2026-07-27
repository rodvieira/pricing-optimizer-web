"use client";

import { useTranslations } from "next-intl";

/**
 * Studio empty state, matching the mock: a dashed-border panel with the
 * three-bar logo mark centered above the message.
 */
export function StudioEmptyState() {
  const t = useTranslations("studio");

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-24 text-center">
      <span aria-hidden className="flex h-6 items-end gap-1">
        <span className="h-3 w-1.5 rounded-sm" style={{ background: "var(--color-icon-orange)" }} />
        <span className="h-6 w-1.5 rounded-sm" style={{ background: "var(--color-icon-teal)" }} />
        <span className="h-4 w-1.5 rounded-sm" style={{ background: "var(--color-icon-pink)" }} />
      </span>
      <h2 className="font-heading text-lg font-semibold text-primary">{t("emptyTitle")}</h2>
      <p className="max-w-md text-sm text-secondary">{t("emptyBody")}</p>
    </div>
  );
}
