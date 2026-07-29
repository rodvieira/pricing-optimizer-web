"use client";

import { Button } from "@/shared/ui";
import { type Locale, useLocaleMode } from "../locale-provider";

// Each language's name is shown in itself ("English", "Português"), never
// translated through the current locale — the standard convention for a
// language picker, so a visitor who can't read the current UI language can
// still recognize their own.
const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
};

/**
 * Toggles English <-> Portuguese, the same one-button pattern ThemeToggle
 * already uses for its own binary choice — replaced the earlier Select-based
 * picker (issue feedback: a two-item dropdown was more control than a
 * two-value choice needed).
 *
 * The accessible label is deliberately English-only, matching ThemeToggle's
 * own untranslated label exactly (neither is run through useTranslations) —
 * consistent with the sibling control this mirrors, not an oversight.
 */
export function LocaleToggle() {
  const { locale, setLocale } = useLocaleMode();
  const next: Locale = locale === "en" ? "pt-BR" : "en";

  return (
    <Button
      label={`Switch language to ${LOCALE_LABEL[next]}`}
      onClick={() => setLocale(next)}
      variant="secondary"
      size="md"
      className="font-mono text-[14px] tracking-wide"
    >
      {LOCALE_LABEL[locale]}
    </Button>
  );
}
