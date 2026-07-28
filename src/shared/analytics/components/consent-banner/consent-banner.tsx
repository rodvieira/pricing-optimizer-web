"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui";
import { useConsent } from "../consent-provider";

/**
 * Renders only while consent is genuinely undecided AND a measurement ID is
 * actually configured — asking a visitor to decide on something that isn't
 * even wired up (local dev, PR previews) would be noise, not care. Nothing
 * loads regardless (see GoogleAnalyticsGate), and nothing is shown once the
 * visitor has accepted or declined.
 */
export function ConsentBanner() {
  const { status, setStatus } = useConsent();
  const t = useTranslations("consent");

  if (status !== "unknown" || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4 sm:px-8">
        <p className="flex-1 text-secondary text-sm">{t("message")}</p>
        <div className="flex gap-2">
          <Button
            label={t("decline")}
            variant="secondary"
            size="sm"
            onClick={() => setStatus("denied")}
          />
          <Button
            label={t("accept")}
            variant="primary"
            size="sm"
            onClick={() => setStatus("granted")}
          />
        </div>
      </div>
    </div>
  );
}
