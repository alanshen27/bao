import { Card, CardHeader } from "../ui/Card";
import { StatusBadge } from "../bao/BaoBadge";
import { ProviderPill } from "../bao/ProviderPill";
import { formatRelative } from "../../lib/format";
import type { SessionDto } from "../../lib/types";

export function AgentStatusCard({ session }: { session: SessionDto }) {
  return (
    <Card>
      <CardHeader
        title="Session status"
        right={<StatusBadge status={session.status} />}
      />
      <div className="space-y-2 px-4 py-3 text-sm">
        <Row label="Code">
          <span className="font-mono text-bao-soy">{session.code}</span>
        </Row>
        <Row label="Kind">
          <span className="capitalize text-bao-soy">{session.kind}</span>
        </Row>
        <Row label="Model">
          <ProviderPill
            providerId={session.providerId}
            modelId={session.modelId}
          />
        </Row>
        <Row label="Updated">
          <span className="text-bao-muted">
            {formatRelative(session.updatedAt)}
          </span>
        </Row>
      </div>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-bao-muted">{label}</span>
      {children}
    </div>
  );
}
