"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/studio", label: "Studio" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="flex h-[18px] items-end gap-[3px]">
            <span className="h-[9px] w-1" style={{ background: "var(--color-icon-orange)" }} />
            <span className="h-[18px] w-1" style={{ background: "var(--color-icon-teal)" }} />
            <span className="h-[13px] w-1" style={{ background: "var(--color-icon-pink)" }} />
          </span>
          {/* Wordmark uses the heading face (Bricolage Grotesque), matching the mock. */}
          <span className="font-heading text-[15px] font-semibold tracking-tight text-primary">
            Pricing Optimizer
          </span>
          <span className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-secondary">
            v1.0
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-[6px] rounded-[9px] border border-border bg-card p-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[7px] px-[13px] py-[7px] font-sans text-[12.5px] leading-[16px] font-medium transition-colors ${
                  pathname === item.href
                    ? "border border-border bg-muted text-primary"
                    : "border border-transparent text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
