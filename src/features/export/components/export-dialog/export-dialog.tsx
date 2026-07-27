"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { trackExportTriggered } from "@/shared/analytics";
import type { ExportFormat } from "@/shared/domain";
import { CodePreview, Dialog, Skeleton, Tabs } from "@/shared/ui";
import { useExport } from "../../hooks/use-export";

const FORMAT_LANGUAGE: Record<ExportFormat, string> = {
  jsx: "tsx",
  html: "html",
  stripe: "json",
};

const FORMAT_LABEL: Record<ExportFormat, string> = {
  jsx: "JSX",
  html: "HTML",
  stripe: "Stripe JSON",
};

const FORMAT_TABS = (Object.keys(FORMAT_LABEL) as ExportFormat[]).map((value) => ({
  value,
  label: FORMAT_LABEL[value],
}));

export interface ExportDialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly generationId: string | null;
  readonly variationId: string | null;
  readonly strategyLabel: string;
}

export function ExportDialog({
  isOpen,
  onOpenChange,
  generationId,
  variationId,
  strategyLabel,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("jsx");
  const { data, isLoading, isError } = useExport(generationId, variationId, format);
  const t = useTranslations("export");

  // Reset to the default tab when the dialog is reopened for a different
  // variation, instead of carrying over whatever format was last viewed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: variationId is intentionally the sole trigger for this reset, not read in the body.
  useEffect(() => {
    setFormat("jsx");
  }, [variationId]);

  // Fires once per successful export result (TanStack Query v5 dropped
  // useQuery's onSuccess option, so a real result is observed here instead).
  // biome-ignore lint/correctness/useExhaustiveDependencies: format is read intentionally, but this must fire once per new `data`, not once per format change alone (data lags format by one fetch).
  useEffect(() => {
    if (data) trackExportTriggered(format);
  }, [data]);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t("dialogTitle", { strategy: strategyLabel })}
    >
      <div className="p-4">
        <Tabs
          value={format}
          onValueChange={(value) => setFormat(value as ExportFormat)}
          items={FORMAT_TABS}
        />
        <div className="pt-4">
          {isLoading && <Skeleton height={240} />}
          {isError && <p className="text-sm text-error">{t("formatError")}</p>}
          {data && (
            <CodePreview
              code={data.content}
              language={FORMAT_LANGUAGE[format]}
              title={t("previewTitle", { format: FORMAT_LABEL[format] })}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
