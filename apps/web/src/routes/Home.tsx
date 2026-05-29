import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaoLogo } from "../components/bao/BaoLogo";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StatusBadge, KindBadge, ServedLocally } from "../components/bao/BaoBadge";
import { NewSessionDialog } from "../components/bao/NewSessionDialog";
import { useSessions } from "../hooks/useSessions";
import { formatRelative, titleForSession } from "../lib/format";

export function Home() {
  const navigate = useNavigate();
  const { sessions, loading } = useSessions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const topLevel = sessions.filter((s) => s.kind !== "subagent");

  return (
    <div className="bao-scroll h-full overflow-y-auto px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <BaoLogo size={56} />
            <div>
              <h1 className="font-display text-2xl font-semibold text-bao-soy">
                Bao
              </h1>
              <p className="text-sm text-bao-muted">
                Wrap models, agents, and tools into one local workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ServedLocally />
            <Button onClick={() => setDialogOpen(true)}>+ New chat</Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-bao-soy">
            Recent sessions
          </h2>
          {loading ? (
            <p className="text-sm text-bao-muted">Loading…</p>
          ) : topLevel.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <BaoLogo size={64} />
              <p className="font-display text-lg text-bao-soy">
                The steamer is empty
              </p>
              <p className="max-w-sm text-sm text-bao-muted">
                Create your first session to chat with a model, run a one-shot
                agent, or spawn little helper baos.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Wrap your first Bao
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {topLevel.map((session) => (
                <Card
                  key={session.code}
                  hoverable
                  className="cursor-pointer p-4"
                  onClick={() => navigate(`/session/${session.code}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-semibold text-bao-soy">
                      {titleForSession(session.title, session.code)}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-bao-muted">
                      {session.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <KindBadge kind={session.kind} />
                      <span className="text-xs text-bao-muted">
                        {formatRelative(session.updatedAt)}
                      </span>
                    </div>
                  </div>
                  {session.childCount > 0 && (
                    <div className="mt-2 text-xs text-bao-muted">
                      {session.childCount} helper
                      {session.childCount === 1 ? "" : "s"}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewSessionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(code) => {
          setDialogOpen(false);
          navigate(`/session/${code}`);
        }}
      />
    </div>
  );
}
