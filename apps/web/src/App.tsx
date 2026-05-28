import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Setup } from "./routes/Setup";
import { Home } from "./routes/Home";
import { Session } from "./routes/Session";
import { AgentDetail } from "./routes/AgentDetail";
import { Settings } from "./routes/Settings";
import { BaoLogo } from "./components/bao/BaoLogo";
import { api } from "./lib/api";
import { baoSocket } from "./lib/ws";

function Splash({ message }: { message: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-bao-bg text-bao-muted">
      <BaoLogo size={64} />
      <p className="font-display text-bao-soy">{message}</p>
    </div>
  );
}

function RequireSetup() {
  const [status, setStatus] = useState<"loading" | "ready" | "needs-setup">(
    "loading",
  );

  useEffect(() => {
    void api
      .getSetupStatus()
      .then((s) => setStatus(s.onboardingCompleted ? "ready" : "needs-setup"))
      .catch(() => setStatus("needs-setup"));
  }, []);

  if (status === "loading") return <Splash message="Warming the steamer…" />;
  if (status === "needs-setup") return <Navigate to="/setup" replace />;
  return <Outlet />;
}

export function App() {
  useEffect(() => {
    baoSocket.connect();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route element={<RequireSetup />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/session/:code" element={<Session />} />
            <Route
              path="/session/:code/agents/:childCode"
              element={<AgentDetail />}
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
