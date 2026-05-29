import { cn } from "../../lib/cn";

interface TabsProps {
  tabs: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-bao-border bg-bao-card-soft p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            active === tab.value
              ? "bg-bao-card text-bao-soy shadow-bao"
              : "text-bao-muted hover:text-bao-soy",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
