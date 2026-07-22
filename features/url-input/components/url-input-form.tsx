"use client";

import { Button } from "@astryxdesign/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { type UrlInputValues, urlInputSchema } from "../url-input-schema";

// Real, reachable sites — the original design mock's flowbase.com/useorbit.io/
// linehq.dev (and product-preview.tsx's decorative "flowbase.com") are
// fictional placeholders that don't resolve, so every click guaranteed a
// ~30s scraper timeout followed by an error (colly's 10s static attempt,
// then chromedp's 20s browser fallback). Found via manual testing.
const EXAMPLE_URLS = ["linear.app", "cal.com", "raycast.com"];

export interface UrlInputFormProps {
  readonly onSubmitUrl: (url: string) => void;
  readonly isBusy: boolean;
  /** Pre-fills the field, e.g. when arriving from a "Watch a live run" link that auto-submits. */
  readonly initialUrl?: string;
}

/**
 * URL input styled to the mock: one bordered pill holding a muted "https://"
 * prefix, the field, and the Analyze button, with bordered "Try:" example
 * pills below. Validation stays react-hook-form + Zod; the field is a raw
 * <input> (not Astryx TextInput) because the mock's embedded-button layout
 * has no Astryx equivalent.
 */
export function UrlInputForm({ onSubmitUrl, isBusy, initialUrl }: UrlInputFormProps) {
  const { control, handleSubmit, setValue, formState } = useForm<UrlInputValues>({
    resolver: zodResolver(urlInputSchema),
    defaultValues: { url: initialUrl ?? "" },
  });
  const errorId = useId();
  const errorMessage = formState.errors.url?.message;

  // initialUrl can arrive after this form has already mounted (it's read
  // from useSearchParams() in a Suspense-isolated sibling, resolved
  // post-hydration — see features/studio/components/studio-auto-run.tsx),
  // so defaultValues alone (read once, at mount) isn't enough to pick it up.
  useEffect(() => {
    if (initialUrl !== undefined) setValue("url", initialUrl);
  }, [initialUrl, setValue]);

  const onSubmit = handleSubmit((values) => onSubmitUrl(values.url));

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div
          className={`flex items-center gap-2 rounded-[10px] border bg-surface p-1.5 transition-colors ${
            errorMessage ? "border-error" : "border-border-strong"
          }`}
        >
          <span aria-hidden className="pl-3 font-mono text-[13px] text-(--po-text-muted)">
            https://
          </span>
          <Controller
            control={control}
            name="url"
            render={({ field }) => (
              <input
                aria-label="Product URL"
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? errorId : undefined}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="your-product.com"
                disabled={isBusy}
                className="min-w-0 flex-1 bg-transparent py-[11px] font-mono text-[14px] text-primary outline-none placeholder:text-(--po-text-muted) disabled:opacity-60"
              />
            )}
          />
          <Button
            type="submit"
            label={isBusy ? "Generating" : "Analyze"}
            variant="primary"
            isLoading={isBusy}
            style={{
              height: 40,
              paddingInline: 20,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </div>
        {errorMessage && (
          <p id={errorId} className="px-1 text-xs text-error">
            {errorMessage}
          </p>
        )}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-[12px] text-(--po-text-muted)">Try:</span>
        {EXAMPLE_URLS.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isBusy}
            onClick={() => setValue("url", example)}
            className="rounded-[6px] border border-border bg-surface px-2.5 py-1 font-mono text-[11.5px] text-secondary transition-colors hover:border-border-strong disabled:opacity-60"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
