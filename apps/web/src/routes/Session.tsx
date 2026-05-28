import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { ChatView } from "../components/chat/ChatView";
import { RightPanel } from "../components/layout/RightPanel";
import { Button } from "../components/ui/Button";
import { useSessionDetail } from "../hooks/useSessionDetail";
import { useConfig } from "../hooks/useConfig";
import { api, ApiError } from "../lib/api";
import { cn } from "../lib/cn";

export function Session() {
  const { code } = useParams<{ code: string }>();
  const { detail, loading, error } = useSessionDetail(code);
  const { config } = useConfig();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-bao-muted">
        Loading session…
      </div>
    );
  }

  if (error || !detail || !code) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-bao-muted">
        <p className="font-display text-lg text-bao-soy">Session not found</p>
        <p className="text-sm">{error ?? "This bao may have been eaten."}</p>
      </div>
    );
  }

  const run = async <T,>(fn: () => Promise<T>) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          session={detail.session}
          actions={
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setPanelOpen((o) => !o)}
            >
              {panelOpen ? "Hide panel" : "Details"}
            </Button>
          }
        />
        {actionError && (
          <div className="border-b border-bao-danger/30 bg-bao-danger/10 px-4 py-2 text-sm text-bao-danger">
            {actionError}
          </div>
        )}
        <ChatView
          messages={detail.messages}
          busy={busy}
          onSend={(content) => run(() => api.sendMessage(code, content))}
          onRun={() => run(() => api.runSession(code))}
          onSpawn={(task) => run(() => api.spawnHelper(code, { task }))}
        />
      </div>

      {/* Right panel: inline on large screens, drawer on small */}
      <div className="hidden lg:block">
        <RightPanel detail={detail} budgetCapUsd={config?.budgetCapUsd} />
      </div>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-bao-soy/30 lg:hidden",
          panelOpen ? "block" : "hidden",
        )}
        onClick={() => setPanelOpen(false)}
        role="presentation"
      >
        <div
          className="absolute right-0 top-0 h-full w-[340px] max-w-[88%] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <RightPanel detail={detail} budgetCapUsd={config?.budgetCapUsd} />
        </div>
      </div>
    </div>
  );
}
