import { STRATEGY_META } from "@/features/generate-stream/strategy-meta";

export function StrategyTrio() {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 px-6 py-16 sm:grid-cols-3">
      {STRATEGY_META.map((meta, index) => (
        <div
          key={meta.strategy}
          className="border-t-2 border-l border-border px-6 pt-5 first:border-l-0"
          style={{ borderTopColor: `var(--color-icon-${meta.variant})` }}
        >
          <div
            className="mb-2 font-mono text-xs tracking-wide"
            style={{ color: `var(--color-icon-${meta.variant})` }}
          >
            {String(index + 1).padStart(2, "0")} · {meta.label}
          </div>
          <p className="max-w-[30ch] text-sm leading-relaxed text-secondary text-pretty">
            {meta.blurb}
          </p>
        </div>
      ))}
    </section>
  );
}
