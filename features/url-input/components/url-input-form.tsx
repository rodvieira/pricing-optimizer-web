"use client";

import { Button } from "@astryxdesign/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { type UrlInputValues, urlInputSchema } from "../url-input-schema";

// Real, fast-scraping domains — these are what the "Try:" pills actually
// submit to the backend, unlike the fictional product names used elsewhere
// in the mock (product-preview.tsx's "flowbase.com" is decorative only and
// never hits the network). A placeholder brand name here would 502 every
// time, since the scraper has nothing real to fetch.
const EXAMPLE_URLS = ["stripe.com", "linear.app", "vercel.com"];

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

  const onSubmit = handleSubmit((values) => onSubmitUrl(values.url));

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-[10px] border border-border-strong bg-surface p-1.5">
          <span aria-hidden className="pl-2 font-mono text-sm text-(--po-text-muted)">
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
                className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm text-primary outline-none placeholder:text-(--po-text-muted) disabled:opacity-60"
              />
            )}
          />
          <Button
            type="submit"
            label={isBusy ? "Generating" : "Analyze"}
            variant="primary"
            isLoading={isBusy}
          />
        </div>
        {errorMessage && (
          <p id={errorId} className="px-1 text-xs text-error">
            {errorMessage}
          </p>
        )}
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sans text-xs text-(--po-text-muted)">Try:</span>
        {EXAMPLE_URLS.map((example) => (
          <button
            key={example}
            type="button"
            disabled={isBusy}
            onClick={() => setValue("url", example)}
            className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-secondary transition-colors hover:border-border-strong disabled:opacity-60"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
