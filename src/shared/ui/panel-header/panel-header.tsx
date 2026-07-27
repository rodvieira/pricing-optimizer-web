import type { ReactNode } from "react";

export interface PanelHeaderProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * The bottom-bordered header bar pattern shared by the browser-chrome mock
 * (landing page product preview) and the variation card header — both were
 * `flex items-center gap-2 border-b border-border px-4 py-3` copied as-is.
 */
export function PanelHeader({ children, className = "" }: PanelHeaderProps) {
  return (
    <div className={`flex items-center gap-2 border-b border-border px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}
