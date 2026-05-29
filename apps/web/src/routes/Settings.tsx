import { useEffect, useState } from "react";
import { Tabs } from "../components/ui/Tabs";
import { Card, CardHeader } from "../components/ui/Card";
import { ProviderSettings } from "../components/settings/ProviderSettings";
import { ToolSettings } from "../components/settings/ToolSettings";
import { BudgetSettings } from "../components/settings/BudgetSettings";
import { useConfig } from "../hooks/useConfig";
import { api } from "../lib/api";
import type { ProviderDto } from "../lib/types";

const TABS = [
  { value: "providers", label: "Providers" },
  { value: "tools", label: "Tools" },
  { value: "budget", label: "Budget" },
  { value: "storage", label: "Local storage" },
];

export function Settings() {
  const { config, update, reload } = useConfig();
  const [tab, setTab] = useState("providers");
  const [providers, setProviders] = useState<ProviderDto[]>([]);

  const loadProviders = () => {
    void api.getProviders().then(setProviders);
  };

  useEffect(loadProviders, []);

  return (
    <div className="bao-scroll h-full overflow-y-auto px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-bao-soy">
            Settings
          </h1>
          <p className="text-sm text-bao-muted">
            Tune Bao's pantry, tools, and budget. Everything stays local.
          </p>
        </div>

        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {!config ? (
          <p className="text-sm text-bao-muted">Loading…</p>
        ) : (
          <>
            {tab === "providers" && (
              <ProviderSettings
                providers={providers}
                onChanged={() => {
                  loadProviders();
                  void reload();
                }}
              />
            )}
            {tab === "tools" && (
              <ToolSettings
                config={config}
                onUpdate={(patch) => void update(patch)}
              />
            )}
            {tab === "budget" && (
              <BudgetSettings
                config={config}
                onUpdate={(patch) => void update(patch)}
              />
            )}
            {tab === "storage" && (
              <section className="space-y-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-bao-soy">
                    Local storage
                  </h2>
                  <p className="text-sm text-bao-muted">
                    Bao is local-first. Your sessions, messages, usage, and
                    memories live in a SQLite database on this machine.
                  </p>
                </div>
                <Card>
                  <CardHeader title="Where your data lives" />
                  <div className="space-y-2 px-4 py-3 text-sm">
                    <Row label="Config" value=".bao/config.json" />
                    <Row label="Secrets" value=".bao/secrets.json" />
                    <Row label="Database" value=".bao/bao.db" />
                    <Row
                      label="Default provider"
                      value={config.defaultProvider}
                    />
                    <Row label="Default model" value={config.defaultModel} />
                  </div>
                </Card>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-bao-muted">{label}</span>
      <span className="font-mono text-bao-soy">{value}</span>
    </div>
  );
}
