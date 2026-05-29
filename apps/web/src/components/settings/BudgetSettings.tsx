import { useEffect, useState } from "react";
import { Card, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { BaoConfig } from "../../lib/types";

export function BudgetSettings({
  config,
  onUpdate,
}: {
  config: BaoConfig;
  onUpdate: (patch: Partial<BaoConfig>) => void;
}) {
  const [value, setValue] = useState(String(config.budgetCapUsd));

  useEffect(() => {
    setValue(String(config.budgetCapUsd));
  }, [config.budgetCapUsd]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-bao-soy">
          Budget
        </h2>
        <p className="text-sm text-bao-muted">
          A soft monthly spending guide. Bao tracks approximate cost per session
          from provider token usage — it is an estimate, not a hard limit.
        </p>
      </div>
      <Card>
        <CardHeader title="Budget cap" subtitle="Approximate USD guide" />
        <div className="flex items-end gap-2 px-4 py-3">
          <Input
            label="Cap (USD)"
            type="number"
            min={0}
            step="0.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="max-w-[160px]"
          />
          <Button
            size="sm"
            onClick={() => {
              const parsed = Number(value);
              if (!Number.isNaN(parsed) && parsed >= 0) {
                onUpdate({ budgetCapUsd: parsed });
              }
            }}
          >
            Save
          </Button>
        </div>
      </Card>
    </section>
  );
}
