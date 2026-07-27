"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../lib/cn";

export interface TabItem {
  readonly value: string;
  readonly label: string;
}

export interface TabsProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly items: readonly TabItem[];
  readonly className?: string;
}

/**
 * Vendored replacement for Astryx's TabList/Tab, over @radix-ui/react-tabs.
 * Content lives outside this component (export-dialog.tsx renders one
 * shared content area keyed off `value`, not per-tab panels), so this
 * renders only Root + List + Trigger, no Tabs.Content — a documented Radix
 * pattern for a tab control driving state elsewhere, not a corner cut.
 */
export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      <TabsPrimitive.List className="flex gap-4 border-border border-b">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "rounded-sm border-b-2 border-transparent px-1 py-2 font-medium text-secondary text-sm transition-colors",
              "data-[state=active]:border-accent data-[state=active]:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
