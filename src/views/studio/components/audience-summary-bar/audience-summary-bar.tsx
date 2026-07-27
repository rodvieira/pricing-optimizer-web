"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { SiteProfile } from "@/shared/domain";
import { ColorDot, Text } from "@/shared/ui";

export function AudienceSummaryBar({ siteProfile }: { readonly siteProfile: SiteProfile }) {
  const t = useTranslations("studio");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <ColorDot color="teal" />
      <Text type="supporting" color="secondary">
        {t.rich("audienceScraped", {
          title: siteProfile.title,
          strong: (chunks) => <strong className="font-mono text-primary">{chunks}</strong>,
        })}
      </Text>
      {/* siteProfile.audience.segment is free-form backend-classified text
          (not a fixed enum), the same category as the LLM-generated pricing
          content — stays untranslated by design (ADR-0019, spec FR-009's
          reasoning extended). sophistication IS a fixed "low"|"medium"|"high"
          enum this app already owns the display wording for. */}
      <Text type="label">{siteProfile.audience.segment}</Text>
      <span className="rounded-md bg-accent-muted px-2 py-1 font-mono text-xs text-accent">
        {t(`sophistication.${siteProfile.audience.sophistication}`)}
      </span>
    </motion.div>
  );
}
