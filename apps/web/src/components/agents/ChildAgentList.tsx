import { Link } from "react-router-dom";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { StatusBadge } from "../bao/BaoBadge";
import { BaoLogo } from "../bao/BaoLogo";
import { titleForSession } from "../../lib/format";
import type { SessionDto } from "../../lib/types";

export function ChildAgentList({
  parentCode,
  children,
}: {
  parentCode: string;
  children: SessionDto[];
}) {
  return (
    <Card>
      <CardHeader
        title="Child agents"
        subtitle="Little baos spawned to help"
        right={<Badge tone="mono">{children.length}</Badge>}
      />
      <div className="space-y-2 px-3 py-3">
        {children.length === 0 ? (
          <p className="py-3 text-center text-sm text-bao-muted">
            No helpers yet. Use “Spawn helper”.
          </p>
        ) : (
          children.map((child) => (
            <Link
              key={child.code}
              to={`/session/${parentCode}/agents/${child.code}`}
              className="flex animate-fade-in items-center gap-3 rounded-xl border border-bao-border bg-bao-card-soft px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-bao"
            >
              <BaoLogo size={32} withSteam={false} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-bao-soy">
                  {titleForSession(child.title, child.code)}
                </div>
                <div className="font-mono text-[11px] text-bao-muted">
                  {child.code}
                </div>
              </div>
              <StatusBadge status={child.status} />
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
