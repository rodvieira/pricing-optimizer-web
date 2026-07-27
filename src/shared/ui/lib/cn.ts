import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class lists the way every shadcn/ui primitive expects: clsx's
 * conditional joining, then tailwind-merge resolving conflicting Tailwind
 * utilities (e.g. a caller's `px-2` overriding a variant's own `px-4`)
 * instead of leaving both in the class list where the DOM order would
 * otherwise decide the winner.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
