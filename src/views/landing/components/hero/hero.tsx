"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Button, Eyebrow, Text } from "@/shared/ui";

// The mock's hero CTAs measure 24px horizontal padding at 15px type, wider
// than Button's own `lg` size — overridden locally via inline style.
const HERO_BUTTON_STYLE = {
  paddingInline: "24px",
  fontSize: "15px",
} as CSSProperties;

// "Watch a live run" jumps straight into the Studio with this example
// already analyzing, so a visitor sees the real product move without typing
// anything first.
const LIVE_RUN_EXAMPLE_URL = "linear.app";

export function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-16 pb-10 sm:px-8">
      <Eyebrow tone="rust" withRule className="mb-6">
        {t("eyebrow")}
      </Eyebrow>
      {/* Two-tone headline: second sentence drops to secondary, matching the
          mock. Font-size/tracking scale down gradually below the mock's
          native 60px/-2.1px so the two lines fit a narrow viewport without
          wrapping onto four or five lines. */}
      <Text
        type="display-1"
        as="h1"
        className="block text-[32px] tracking-[-1.1px] text-balance sm:text-[42px] sm:tracking-[-1.4px] lg:text-[60px] lg:tracking-[-2.1px]"
      >
        {t("headlineMain")}
        <br />
        <span className="text-secondary">{t("headlineSecondary")}</span>
      </Text>
      {/* font-normal: the `large` Text type defaults to 600; the mock's subcopy is 400. */}
      <Text
        type="large"
        color="secondary"
        className="mt-6 block max-w-xl text-[15px] font-normal text-pretty sm:text-[16px] lg:text-[17px]"
      >
        {t("subcopy")}
      </Text>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          label={t("openStudioCta")}
          variant="primary"
          size="lg"
          href="/studio"
          style={HERO_BUTTON_STYLE}
        />
        <Button
          label={t("watchLiveRunCta")}
          variant="secondary"
          size="lg"
          href={`/studio?url=${LIVE_RUN_EXAMPLE_URL}`}
          style={HERO_BUTTON_STYLE}
        />
      </div>
    </section>
  );
}
