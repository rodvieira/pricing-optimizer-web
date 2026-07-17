"use client";

import { Button, TextInput } from "@astryxdesign/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { type UrlInputValues, urlInputSchema } from "../url-input-schema";

const EXAMPLE_URLS = ["flowbase.com", "useorbit.io", "linehq.dev"];

export interface UrlInputFormProps {
  readonly onSubmitUrl: (url: string) => void;
  readonly isBusy: boolean;
}

export function UrlInputForm({ onSubmitUrl, isBusy }: UrlInputFormProps) {
  const { control, handleSubmit, setValue, formState } = useForm<UrlInputValues>({
    resolver: zodResolver(urlInputSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = handleSubmit((values) => onSubmitUrl(values.url));

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex items-start gap-2">
        <Controller
          control={control}
          name="url"
          render={({ field }) => (
            <TextInput
              label="Product URL"
              isLabelHidden
              value={field.value}
              onChange={field.onChange}
              placeholder="your-product.com"
              width="100%"
              hasClear
              isDisabled={isBusy}
              status={
                formState.errors.url
                  ? { type: "error", message: formState.errors.url.message }
                  : undefined
              }
            />
          )}
        />
        <Button
          type="submit"
          label={isBusy ? "Generating" : "Analyze"}
          variant="primary"
          isLoading={isBusy}
        />
      </form>
      <div className="flex flex-wrap items-center gap-2 text-sm text-secondary">
        <span>Try:</span>
        {EXAMPLE_URLS.map((example) => (
          <Button
            key={example}
            label={example}
            variant="ghost"
            size="sm"
            isDisabled={isBusy}
            onClick={() => setValue("url", example)}
          />
        ))}
      </div>
    </div>
  );
}
