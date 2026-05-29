import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BaoLogo } from "../bao/BaoLogo";
import { ServedLocally } from "../bao/BaoBadge";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { NewSessionDialog } from "../bao/NewSessionDialog";
import { cn } from "../../lib/cn";
import { formatRelative, titleForSession } from "../../lib/format";
import type { SessionDto } from "../../lib/types";

interface SidebarProps {
  sessions: SessionDto[];
  loading: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ sessions, loading, onNavigate }: SidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const topLevel = sessions.filter((s) => s.kind !== "subagent");

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-bao-border bg-bao-card/60">
      <div className="flex items-center gap-3 px-4 py-4">
        <BaoLogo size={40} />
        <div>
          <div className="font-display text-lg font-semibold leading-none text-bao-soy">
            Bao
          </div>
          <div className="mt-1 text-xs text-bao-muted">local agent kitchen</div>
        </div>
      </div>

      <div className="px-3">
        <Button className="w-full" onClick={() => setDialogOpen(true)}>
          + New chat
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between px-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-bao-muted">
          Recent
        </span>
        <Badge tone="mono">{topLevel.length}</Badge>
      </div>

      <nav className="bao-scroll mt-1 flex-1 space-y-1 overflow-y-auto px-2 py-1">
        {loading && (
          <div className="px-2 py-6 text-center text-sm text-bao-muted">
            Loading…
          </div>
        )}
        {!loading && topLevel.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-bao-muted">
            No sessions yet. Wrap your first Bao.
          </div>
        )}
        {topLevel.map((session) => (
          <NavLink
            key={session.code}
            to={`/session/${session.code}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "block rounded-xl px-3 py-2 transition-colors",
                isActive
                  ? "bg-bao-card-soft text-bao-soy shadow-bao"
                  : "text-bao-text hover:bg-bao-card-soft/70",
              )
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {titleForSession(session.title, session.code)}
              </span>
              {session.status === "running" && (
                <span className="h-2 w-2 shrink-0 animate-soft-pulse rounded-full bg-bao-chili" />
              )}
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="font-mono text-[11px] text-bao-muted">
                {session.code}
              </span>
              <span className="text-[11px] text-bao-muted">
                {formatRelative(session.updatedAt)}
              </span>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-bao-border px-4 py-3">
        <ServedLocally />
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "rounded-lg px-2 py-1 text-sm font-medium transition-colors",
              isActive ? "text-bao-chili" : "text-bao-muted hover:text-bao-soy",
            )
          }
        >
          Settings
        </NavLink>
      </div>

      <NewSessionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(code) => {
          setDialogOpen(false);
          navigate(`/session/${code}`);
        }}
      />
    </aside>
  );
}
