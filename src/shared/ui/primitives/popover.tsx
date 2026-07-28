"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export const PopoverRoot = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export interface PopoverContentProps {
  readonly children: ReactNode;
  /**
   * Accessible name for the content panel — required, not optional. Radix
   * renders this as `role="dialog"` with no name of its own; axe-core's
   * `aria-dialog-name` rule (correctly) flags an unlabeled one as a serious
   * violation, caught by this repo's own e2e a11y checks before it shipped.
   */
  readonly label: string;
  readonly className?: string;
  readonly align?: "start" | "center" | "end";
  readonly sideOffset?: number;
}

/**
 * Popover over @radix-ui/react-popover: a lighter, non-modal overlay
 * (dismisses on outside click/Escape, no backdrop, no focus trap) — chosen
 * over the existing Dialog primitive for the header settings menu, which is
 * a quick, low-stakes flip of two controls, not the kind of committed,
 * page-blocking interaction Dialog's overlay + centered layout suits (its
 * one other consumer, ExportDialog, has real multi-tab content). A second
 * primitive for a second interaction shape, not a Dialog reused past its fit.
 */
export function PopoverContent({
  children,
  label,
  className,
  align = "end",
  sideOffset = 8,
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        aria-label={label}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-lg border border-border bg-card p-3 shadow-lg outline-none",
          className,
        )}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
