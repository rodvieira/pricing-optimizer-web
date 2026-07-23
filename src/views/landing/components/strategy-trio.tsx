import { STRATEGY_META } from "@/entities/strategy";
import { ColorAccentColumn } from "@/shared/ui/color-accent-column";
import { Eyebrow } from "@/shared/ui/eyebrow";

export function StrategyTrio() {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-0 px-6 py-16 sm:grid-cols-3 sm:px-8">
      {STRATEGY_META.map((meta, index) => (
        <ColorAccentColumn key={meta.strategy} color={meta.variant} className="px-6 pt-5 pb-6">
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
