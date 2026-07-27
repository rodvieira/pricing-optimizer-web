import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:opacity-90",
        secondary: "border border-border-strong bg-transparent text-primary hover:bg-muted",
        ghost: "bg-transparent text-secondary hover:bg-muted hover:text-primary",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  /** Always the accessible name; also the visible text when no `children` is given. */
  readonly label: string;
  readonly children?: ReactNode;
  readonly icon?: ReactNode;
  readonly isLoading?: boolean;
  readonly isDisabled?: boolean;
  readonly href?: string;
  readonly type?: "button" | "submit";
  readonly onClick?: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * cva-driven Button, same prop shape (label/isDisabled/icon/isLoading/href/
 * variant/size) as the design-system component this replaced. Colors are
 * this app's own token utilities (bg-accent and friends, defined in
 * app/globals.css).
 */
export function Button({
  label,
  children,
  icon,
  isLoading,
  isDisabled,
  href,
  variant = "primary",
  size,
  className,
  style,
  onClick,
  type,
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const content = (
    <>
      {icon}
      {children ?? label}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} data-variant={variant} className={classes} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      aria-busy={isLoading || undefined}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      data-variant={variant}
      className={classes}
      style={style}
    >
      {content}
    </button>
  );
}
