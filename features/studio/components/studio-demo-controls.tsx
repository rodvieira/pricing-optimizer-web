"use client";

export type DemoScenario = "none" | "error" | "slow";

export interface StudioDemoControlsProps {
  readonly active: DemoScenario;
  readonly onReset: () => void;
  readonly onServerError: () => void;
  readonly onSlow: () => void;
}

interface PillProps {
  readonly label: string;
  readonly isActive?: boolean;
  readonly onClick: () => void;
}

function DemoPill({ label, isActive = false, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-md border px-2.5 py-1.5 font-sans text-xs font-medium transition-colors ${
        isActive
          ? "border-border-strong bg-muted text-primary"
          : "border-border bg-surface text-secondary hover:border-border-strong"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * The mock's Studio demo toolbar. With no live backend (issue #4), these drive
 * the fixture-backed demo states so the Studio's error and slow-generation UI
 * are viewable on their own. "Reset" clears back to the empty state.
 */
export function StudioDemoControls({
  active,
  onReset,
  onServerError,
  onSlow,
}: StudioDemoControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 font-mono text-[10px] tracking-widest text-(--po-text-muted)">
        DEMO
      </span>
      <DemoPill label="Reset" onClick={onReset} />
      <DemoPill label="Server error" isActive={active === "error"} onClick={onServerError} />
      <DemoPill label="Slow generation" isActive={active === "slow"} onClick={onSlow} />
    </div>
  );
}
