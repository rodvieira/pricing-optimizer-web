import { Text } from "@astryxdesign/core";
import { motion } from "motion/react";
import type { SiteProfile } from "@/shared/domain";
import { ColorDot } from "@/shared/ui/color-dot";

function sophisticationLabel(profile: SiteProfile): string {
  return `${profile.audience.sophistication} sophistication`;
}

export function AudienceSummaryBar({ siteProfile }: { readonly siteProfile: SiteProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <ColorDot color="teal" />
      <Text type="supporting" color="secondary">
        Scraped <strong className="font-mono text-primary">{siteProfile.title}</strong> — detected
        audience
      </Text>
      <Text type="label">{siteProfile.audience.segment}</Text>
      <span className="rounded-md bg-accent-muted px-2 py-1 font-mono text-xs text-accent">
        {sophisticationLabel(siteProfile)}
      </span>
    </motion.div>
  );
}
