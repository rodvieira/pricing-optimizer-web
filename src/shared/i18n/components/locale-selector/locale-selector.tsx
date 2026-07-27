"use client";

import { useTranslations } from "next-intl";
import { Select, type SelectItem } from "@/shared/ui/primitives/select";
import { type Locale, useLocaleMode } from "../locale-provider";

/**
 * Each language's name is shown in itself ("English", "Português"), never
 * translated through the current locale — the standard convention for a
 * language picker, so a visitor who can't read the current UI language can
 * still recognize and select their own.
 */
const LOCALE_ITEMS: readonly SelectItem[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português" },
];

/** Language selector rendered in the app header, next to ThemeToggle. */
export function LocaleSelector() {
  const { locale, setLocale } = useLocaleMode();
  const t = useTranslations("nav");

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value as Locale)}
      items={LOCALE_ITEMS}
      label={t("language")}
    />
  );
}
