import { useState } from "react";
import { Card, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { api } from "../../lib/api";
import type { ProviderDto } from "../../lib/types";

interface FieldDef {
  key: string;
  label: string;
  secret: boolean;
  placeholder: string;
}

const PROVIDER_FIELDS: Record<string, FieldDef[]> = {
  openai: [
    { key: "apiKey", label: "API key", secret: true, placeholder: "sk-…" },
  ],
  anthropic: [
    { key: "apiKey", label: "API key", secret: true, placeholder: "sk-ant-…" },
  ],
  deepseek: [
    { key: "apiKey", label: "API key", secret: true, placeholder: "sk-…" },
    {
      key: "baseUrl",
      label: "Base URL",
      secret: false,
      placeholder: "https://api.deepseek.com",
    },
  ],
  openrouter: [
    { key: "apiKey", label: "API key", secret: true, placeholder: "sk-or-…" },
    {
      key: "baseUrl",
      label: "Base URL",
      secret: false,
      placeholder: "https://openrouter.ai/api/v1",
    },
  ],
  ollama: [
    {
      key: "baseUrl",
      label: "Base URL",
      secret: false,
      placeholder: "http://localhost:11434",
    },
  ],
};

function ProviderCard({
  provider,
  onSaved,
}: {
  provider: ProviderDto;
  onSaved: () => void;
}) {
  const fields = PROVIDER_FIELDS[provider.id];
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!fields) {
    return (
      <Card>
        <CardHeader
          title={provider.name}
          subtitle="Always available — no setup required"
          right={<Badge tone="local">ready</Badge>}
        />
      </Card>
    );
  }

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== ""),
      );
      await api.saveProviderSecrets(provider.id, payload);
      setValues({});
      setMessage("Saved");
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={provider.name}
        subtitle={provider.models.slice(0, 3).join(", ") || provider.kind}
        right={
          <Badge tone={provider.configured ? "completed" : "neutral"}>
            {provider.configured ? "configured" : "not set"}
          </Badge>
        }
      />
      <div className="space-y-3 px-4 py-3">
        {fields.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            type={field.secret ? "password" : "text"}
            placeholder={field.placeholder}
            autoComplete="off"
            value={values[field.key] ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          />
        ))}
        <div className="flex items-center justify-between">
          <span className="text-xs text-bao-muted">{message}</span>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ProviderSettings({
  providers,
  onChanged,
}: {
  providers: ProviderDto[];
  onChanged: () => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-bao-soy">
          Model pantry
        </h2>
        <p className="text-sm text-bao-muted">
          Choose what models Bao can cook with. Keys are stored locally and
          never leave your machine.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onSaved={onChanged}
          />
        ))}
      </div>
    </section>
  );
}
