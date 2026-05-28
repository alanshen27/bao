import { Card, CardHeader } from "../ui/Card";
import type { UsageSummaryDto } from "../../lib/types";
import { formatTokens, formatUsd } from "../../lib/format";

export function UsageCrumbs({
  usage,
  budgetCapUsd,
}: {
  usage: UsageSummaryDto;
  budgetCapUsd?: number;
}) {
  const crumbs = [
    { label: "input", value: formatTokens(usage.inputTokens) },
    { label: "output", value: formatTokens(usage.outputTokens) },
    { label: "total", value: formatTokens(usage.totalTokens) },
  ];

  return (
    <Card>
      <CardHeader title="Usage crumbs" subtitle="Tokens nibbled this session" />
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {crumbs.map((crumb) => (
          <div
            key={crumb.label}
            className="rounded-xl bg-bao-card-soft px-2 py-2 text-center"
          >
            <div className="font-mono text-base font-semibold text-bao-soy">
              {crumb.value}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-bao-muted">
              {crumb.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-bao-border/70 px-4 py-2 text-xs text-bao-muted">
        <span>est. cost</span>
        <span className="font-mono text-bao-soy">
          {formatUsd(usage.estimatedCostUsd)}
          {budgetCapUsd !== undefined && (
            <span className="text-bao-muted"> / {formatUsd(budgetCapUsd)}</span>
          )}
        </span>
      </div>
    </Card>
  );
}
