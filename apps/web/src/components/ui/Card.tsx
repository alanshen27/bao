import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ className, children, hoverable, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-bao-border bg-bao-card shadow-bao",
        hoverable &&
          "transition-all duration-150 hover:-translate-y-0.5 hover:shadow-bao-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-bao-border/70 px-4 py-3">
      <div>
        <div className="font-display text-sm font-semibold text-bao-soy">
          {title}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-bao-muted">{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}
