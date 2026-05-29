import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { BaoConfig } from "../lib/types";

export function useConfig() {
  const [config, setConfig] = useState<BaoConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setConfig(await api.getConfig());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    }
  }, []);

  const update = useCallback(async (patch: Partial<BaoConfig>) => {
    const next = await api.updateConfig(patch);
    setConfig(next);
    return next;
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { config, error, reload, update };
}
