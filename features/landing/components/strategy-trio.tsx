import { ColorAccentColumn } from "@/components/ui/color-accent-column";
import { Eyebrow } from "@/components/ui/eyebrow";
import { STRATEGY_META } from "@/features/generate-stream/strategy-meta";

export function StrategyTrio() {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 px-6 py-16 sm:grid-cols-3">
      {STRATEGY_META.map((meta, index) => (
        <ColorAccentColumn key={meta.strategy} color={meta.variant} className="px-6 pt-5">
          <Eyebrow
            tone="inherit"
            className="mb-2"
            style={{ color: `var(--color-icon-${meta.variant})` }}
          >
            {String(index + 1).padStart(2, "0")} · {meta.label}
          </Eyebrow>
          <p className="max-w-[30ch] text-sm leading-relaxed text-secondary text-pretty">
            {meta.blurb}
          </p>
        </ColorAccentColumn>
      ))}
    </section>
  );
}
