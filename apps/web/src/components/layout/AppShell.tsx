import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BaoLogo } from "../bao/BaoLogo";
import { useSessions } from "../../hooks/useSessions";
import { cn } from "../../lib/cn";

export function AppShell() {
  const { sessions, loading } = useSessions();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bao-bg text-bao-text">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar sessions={sessions} loading={loading} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-bao-soy/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <div
            className="h-full w-[260px] animate-fade-in bg-bao-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              sessions={sessions}
              loading={loading}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-2 border-b border-bao-border bg-bao-card/60 px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "rounded-lg border border-bao-border px-2 py-1 text-sm text-bao-soy",
            )}
            aria-label="Open menu"
          >
            ☰
          </button>
          <BaoLogo size={28} withSteam={false} />
          <span className="font-display font-semibold text-bao-soy">Bao</span>
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
