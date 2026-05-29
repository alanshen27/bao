import { useEffect, useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import type { ProviderDto } from "../../lib/types";

interface NewSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (code: string) => void;
}

export function NewSessionDialog({
  open,
  onClose,
  onCreated,
}: NewSessionDialogProps) {
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("chat");
  const [providerId, setProviderId] = useState("mock");
  const [modelId, setModelId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void api.getProviders().then((list) => {
      setProviders(list);
      if (list.length > 0 && !list.some((p) => p.id === providerId)) {
        setProviderId(list[0].id);
      }
    });
  }, [open, providerId]);

  const selected = providers.find((p) => p.id === providerId);
  const models = selected?.models ?? [];

  useEffect(() => {
    if (models.length > 0 && !models.includes(modelId)) {
      setModelId(models[0]);
    }
  }, [models, modelId]);

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const session = await api.createSession({
        title: title.trim() || undefined,
        kind,
        providerId,
        modelId: modelId || undefined,
      });
      onCreated(session.code);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Wrap a new Bao"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "Steaming…" : "Create session"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Title (optional)"
          placeholder="New Bao"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select
          label="Kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          options={[
            { value: "chat", label: "Chat" },
            { value: "agent", label: "Agent" },
          ]}
        />
        <Select
          label="Provider"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          options={providers.map((p) => ({
            value: p.id,
            label: `${p.name}${p.configured ? "" : " (not configured)"}`,
          }))}
        />
        {models.length > 0 && (
          <Select
            label="Model"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            options={models.map((m) => ({ value: m, label: m }))}
          />
        )}
        {error && <p className="text-sm text-bao-danger">{error}</p>}
      </div>
    </Dialog>
  );
}
