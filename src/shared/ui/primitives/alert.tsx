import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface AlertProps {
  /** Only "error" is used today; extend when a real second case shows up. */
  readonly status: "error";
  readonly title: string;
  readonly description?: string;
  readonly endContent?: ReactNode;
  readonly className?: string;
}

/** Vendored replacement for Astryx's Banner, renamed to match shadcn/ui's Alert. */
export function Alert({ title, description, endContent, className }: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border border-error bg-error-muted px-4 py-3",
        className,
      )}
    >
      <div>
        <p className="font-semibold text-error text-sm">{title}</p>
        {description && <p className="mt-1 text-error text-sm">{description}</p>}
      </div>
      {endContent}
    </div>
  );
}
