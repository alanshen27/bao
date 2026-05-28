import type { ReactNode } from "react";
import { StatusBadge, KindBadge } from "../bao/BaoBadge";
import { ProviderPill } from "../bao/ProviderPill";
import type { SessionDto } from "../../lib/types";
import { titleForSession } from "../../lib/format";

export function Header({
  session,
  actions,
}: {
  session: SessionDto;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-bao-border bg-bao-card/60 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="truncate font-display text-lg font-semibold text-bao-soy">
            {titleForSession(session.title, session.code)}
          </h1>
          <KindBadge kind={session.kind} />
          <StatusBadge status={session.status} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-xs text-bao-muted">
            {session.code}
          </span>
          <span className="text-bao-border">·</span>
          <ProviderPill
            providerId={session.providerId}
            modelId={session.modelId}
          />
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
