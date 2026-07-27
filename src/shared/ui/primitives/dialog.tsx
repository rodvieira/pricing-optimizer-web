"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export interface DialogProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * Vendored replacement for Astryx's Dialog + DialogHeader, over
 * @radix-ui/react-dialog. Folds the title row and close button directly in
 * (shadcn/ui's own convention) rather than keeping a separate DialogHeader
 * component — this repo has exactly one Dialog consumer, so a second
 * composable piece would be an abstraction with no second caller.
 * `aria-describedby={undefined}` on Content opts out of Radix's
 * description requirement rather than leaving an unresolved warning: this
 * dialog's content (a code preview) has no natural one-line description.
 *
 * Every caller here opens this dialog via its own `isOpen` state rather than
 * a `DialogPrimitive.Trigger` (the "Export" button lives on each variation
 * card, driving a strategy-keyed piece of state in StudioPage, not a ref
 * Radix can see). Radix's default close-focus-restoration only works when
 * its own Trigger opened the dialog, so without this it silently does
 * nothing on close — caught by a real keyboard e2e test, not assumed.
 * Captured manually instead: remember whatever had focus right as this
 * opens, and hand it back on close.
 */
export function Dialog({ isOpen, onOpenChange, title, children }: DialogProps) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) triggerRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[720px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <DialogPrimitive.Title className="font-heading font-semibold text-sm">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-md p-1 text-secondary hover:bg-muted hover:text-primary"
            >
              <X size={16} />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
