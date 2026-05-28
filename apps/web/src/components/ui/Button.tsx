import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "text-white hover:-translate-y-0.5 active:translate-y-0 [background:linear-gradient(135deg,#e56a3a,#f09a52)]",
  secondary:
    "bg-bao-card text-bao-soy border border-bao-border hover:bg-bao-card-soft",
  ghost: "bg-transparent text-bao-muted hover:bg-bao-card-soft",
  danger:
    "bg-bao-danger text-white hover:-translate-y-0.5 active:translate-y-0",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
