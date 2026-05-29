import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium text-bao-muted">
          {label}
        </span>
      )}
      <textarea
        className={cn(
          "w-full resize-none rounded-xl border border-bao-border bg-bao-card px-3 py-2 text-sm text-bao-text placeholder:text-bao-muted/70",
          "focus:border-bao-chili focus:outline-none focus:ring-2 focus:ring-bao-ring/40",
          className,
        )}
        {...props}
      />
    </label>
  );
}
