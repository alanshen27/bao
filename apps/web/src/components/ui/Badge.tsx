import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone =
  | "neutral"
  | "running"
  | "completed"
  | "failed"
  | "paused"
  | "local"
  | "mono";

const tones: Record<Tone, string> = {
  neutral: "bg-bao-card-soft text-bao-soy border-bao-border",
  running: "bg-bao-chili/15 text-bao-chili border-bao-chili/30",
  completed: "bg-bao-scallion/15 text-bao-scallion border-bao-scallion/30",
  failed: "bg-bao-danger/15 text-bao-danger border-bao-danger/30",
  paused: "bg-bao-sesame/15 text-bao-soy border-bao-sesame/40",
  local: "bg-bao-scallion/15 text-bao-scallion border-bao-scallion/30",
  mono: "bg-bao-card-soft text-bao-soy border-bao-border font-mono",
};

export function Badge({
  children,
  tone = "neutral",
  pulse,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
