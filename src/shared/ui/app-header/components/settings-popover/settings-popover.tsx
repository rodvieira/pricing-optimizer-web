"use client";

import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSelector } from "@/shared/i18n";
import { ThemeToggle } from "@/shared/theme";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "@/shared/ui/primitives";

/**
 * Single header control replacing the old standalone nav pills, LocaleSelector,
 * and ThemeToggle (issue #44): a gear icon opens a popover housing the latter
 * two. Neither ThemeModeProvider nor LocaleProvider changes — this only
 * relocates their existing controls, it isn't a second state owner.
 */
export function SettingsPopover() {
  const t = useTranslations("header");

  return (
    <PopoverRoot>
      {/* Styled directly rather than composing the shared Button through
          PopoverTrigger's asChild: Button neither forwards a ref nor spreads
          arbitrary props, both of which Radix's Trigger needs (ref for
          positioning, spread props for its own aria-expanded/aria-haspopup)
          to wire up correctly. */}
      <PopoverTrigger
        aria-label={t("settings")}
        className="rounded-md p-2 text-secondary transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Settings size={16} />
      </PopoverTrigger>
      <PopoverContent label={t("settings")} className="flex w-56 flex-col gap-3">
        <LocaleSelector />
        <ThemeToggle />
      </PopoverContent>
    </PopoverRoot>
  );
}
