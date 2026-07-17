"use client";

import {
  CodeBlock,
  Dialog,
  DialogHeader,
  Layout,
  LayoutContent,
  Skeleton,
  Tab,
  TabList,
} from "@astryxdesign/core";
import { useEffect, useState } from "react";
import type { ExportFormat } from "@/domain";
import { useExport } from "./use-export";

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

  // Reset to the default tab when the dialog is reopened for a different
  // variation, instead of carrying over whatever format was last viewed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: variationId is intentionally the sole trigger for this reset, not read in the body.
  useEffect(() => {
    setFormat("jsx");
  }, [variationId]);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={720} purpose="info">
      <Layout
        header={<DialogHeader title={`Export — ${strategyLabel}`} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <TabList
              value={format}
              onChange={(value) => setFormat(value as ExportFormat)}
              hasDivider
            >
              <Tab value="jsx" label="JSX" />
              <Tab value="html" label="HTML" />
              <Tab value="stripe" label="Stripe JSON" />
            </TabList>
            <div className="pt-4">
              {isLoading && <Skeleton height={240} />}
              {isError && (
                <p className="text-sm text-error">
                  Couldn't generate this export format. Try switching tabs or reopening the dialog.
                </p>
              )}
              {data && (
                <CodeBlock
                  code={data.content}
                  language={FORMAT_LANGUAGE[format]}
                  title={`${FORMAT_LABEL[format]} export`}
                  hasCopyButton
                  hasLineNumbers
                  width="100%"
                  maxHeight={420}
                />
              )}
            </div>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
