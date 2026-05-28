import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaoLogo } from "../components/bao/BaoLogo";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/cn";
import { api } from "../lib/api";
import type { ProviderDto } from "../lib/types";

export function Setup() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [selected, setSelected] = useState("mock");
  const [secrets, setSecrets] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.getProviders().then(setProviders);
  }, []);

  const setSecret = (providerId: string, key: string, value: string) => {
    setSecrets((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], [key]: value },
    }));
  };

  const active = providers.find((p) => p.id === selected);
  const defaultModel = active?.models[0];

  const complete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const cleanSecrets = Object.fromEntries(
        Object.entries(secrets)
          .map(([pid, fields]) => [
            pid,
            Object.fromEntries(
              Object.entries(fields).filter(([, v]) => v !== ""),
            ),
          ])
          .filter(([, fields]) => Object.keys(fields).length > 0),
      );
      await api.completeSetup({
        defaultProvider: selected,
        defaultModel,
        secrets: cleanSecrets as Record<string, Record<string, string>>,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete setup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-bao-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <BaoLogo size={72} />
          <h1 className="mt-3 font-display text-3xl font-semibold text-bao-soy">
            Welcome to Bao
          </h1>
          <p className="mt-1 text-bao-muted">Your local agent kitchen.</p>
          <p className="mt-3 max-w-md text-sm text-bao-muted">
            Everything is stored locally on your machine in a small SQLite
            database. Choose what models Bao can cook with. Start with mock
            mode, or connect a provider.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader
            title="Choose a default provider"
            subtitle="You can change this and add more later in Settings."
          />
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => setSelected(provider.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-all",
                  selected === provider.id
                    ? "border-bao-chili bg-bao-card-soft shadow-bao"
                    : "border-bao-border bg-bao-card hover:bg-bao-card-soft",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-bao-soy">
                    {provider.name}
                  </span>
                  <Badge tone="mono">{provider.kind}</Badge>
                </div>
                <div className="mt-1 text-[11px] text-bao-muted">
                  {provider.id === "mock"
                    ? "No key needed"
                    : provider.id === "ollama"
                      ? "Local models"
                      : "Needs API key"}
                </div>
              </button>
            ))}
          </div>

          {active && active.id !== "mock" && (
            <div className="space-y-3 border-t border-bao-border px-4 py-4">
              {(active.id === "openai" ||
                active.id === "anthropic" ||
                active.id === "deepseek" ||
                active.id === "openrouter") && (
                <Input
                  label={`${active.name} API key`}
                  type="password"
                  autoComplete="off"
                  placeholder="Paste your key (optional — you can add it later)"
                  value={secrets[active.id]?.apiKey ?? ""}
                  onChange={(e) =>
                    setSecret(active.id, "apiKey", e.target.value)
                  }
                />
              )}
              {(active.id === "deepseek" ||
                active.id === "openrouter" ||
                active.id === "ollama") && (
                <Input
                  label="Base URL"
                  placeholder={
                    active.id === "ollama"
                      ? "http://localhost:11434"
                      : "https://…"
                  }
                  value={secrets[active.id]?.baseUrl ?? ""}
                  onChange={(e) =>
                    setSecret(active.id, "baseUrl", e.target.value)
                  }
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-bao-border px-4 py-3">
            {error ? (
              <span className="text-sm text-bao-danger">{error}</span>
            ) : (
              <span className="text-xs text-bao-muted">
                Mock mode works instantly with no keys.
              </span>
            )}
            <Button onClick={complete} disabled={submitting}>
              {submitting ? "Setting the table…" : "Enter the kitchen"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
