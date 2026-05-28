import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { baoSocket } from "../lib/ws";
import type { SessionDto } from "../lib/types";

export function useSessions() {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSessions(await api.getSessions());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = baoSocket.subscribe((event) => {
      if (event.type === "session.created" || event.type === "session.updated") {
        void refresh();
      }
    });
    return unsubscribe;
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
