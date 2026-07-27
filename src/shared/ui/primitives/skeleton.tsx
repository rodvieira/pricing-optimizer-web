export interface SkeletonProps {
  readonly width?: number | string;
  readonly height?: number;
  /** Staggers the pulse animation so adjacent skeleton lines don't pulse in lockstep. */
  readonly index?: number;
}

/** Vendored replacement for Astryx's Skeleton: a pulsing placeholder bar. */
export function Skeleton({ width = "100%", height = 16, index = 0 }: SkeletonProps) {
  return (
    <div
      className="animate-pulse rounded-md bg-[var(--color-skeleton)]"
      style={{ width, height, animationDelay: `${index * 150}ms` }}
    />
  );
}
