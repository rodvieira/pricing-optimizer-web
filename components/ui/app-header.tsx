"use client";

import { Text } from "@astryxdesign/core";
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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="flex h-[18px] items-end gap-[3px]">
            <span className="h-[9px] w-1" style={{ background: "var(--color-icon-orange)" }} />
            <span className="h-[18px] w-1" style={{ background: "var(--color-icon-teal)" }} />
            <span className="h-[13px] w-1" style={{ background: "var(--color-icon-pink)" }} />
          </span>
          <Text type="label">Pricing Optimizer</Text>
          <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-secondary">
            v1.0
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 rounded-lg bg-card p-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 font-sans text-xs font-medium text-primary transition-colors ${
                  pathname === item.href ? "bg-muted" : "opacity-70 hover:opacity-100"
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
