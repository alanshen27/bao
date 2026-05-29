import { Card, CardHeader } from "../ui/Card";
import { cn } from "../../lib/cn";
import type { BaoConfig } from "../../lib/types";

function Toggle({
  checked,
  onChange,
  label,
  description,
  warning,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-bao-soy">{label}</div>
        <div className="text-xs text-bao-muted">{description}</div>
        {warning && checked && (
          <div className="mt-1 text-xs text-bao-danger">
            Shell access can run commands on your machine. Use with care.
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-bao-chili bg-bao-chili"
            : "border-bao-border bg-bao-card-soft",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function ToolSettings({
  config,
  onUpdate,
}: {
  config: BaoConfig;
  onUpdate: (patch: Partial<BaoConfig>) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-bao-soy">
          Tools
        </h2>
        <p className="text-sm text-bao-muted">
          Decide which local tools Bao agents may reach for.
        </p>
      </div>
      <Card>
        <CardHeader title="Plugins" subtitle="Built-in local tools" />
        <div className="divide-y divide-bao-border/70">
          <Toggle
            label="Filesystem"
            description="Read, write, and search files inside this project."
            checked={config.tools.filesystem.enabled}
            onChange={(enabled) =>
              onUpdate({
                tools: { ...config.tools, filesystem: { enabled } },
              })
            }
          />
          <Toggle
            label="Memory"
            description="Save, list, and search small notes locally."
            checked={config.tools.memory.enabled}
            onChange={(enabled) =>
              onUpdate({ tools: { ...config.tools, memory: { enabled } } })
            }
          />
          <Toggle
            label="Shell"
            description="Run shell commands in the project directory."
            warning
            checked={config.tools.shell.enabled}
            onChange={(enabled) =>
              onUpdate({ tools: { ...config.tools, shell: { enabled } } })
            }
          />
        </div>
      </Card>
    </section>
  );
}
