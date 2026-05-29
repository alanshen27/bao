import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({
  label,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium text-bao-muted">
          {label}
        </span>
      )}
      <select
        className={cn(
          "w-full rounded-xl border border-bao-border bg-bao-card px-3 py-2 text-sm text-bao-text",
          "focus:border-bao-chili focus:outline-none focus:ring-2 focus:ring-bao-ring/40",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
