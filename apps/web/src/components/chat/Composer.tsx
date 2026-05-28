import { useState } from "react";
import { Button } from "../ui/Button";

interface ComposerProps {
  onSend: (content: string) => Promise<void>;
  onRun: () => Promise<void>;
  onSpawn: (task: string) => Promise<void>;
  busy: boolean;
}

export function Composer({ onSend, onRun, onSpawn, busy }: ComposerProps) {
  const [value, setValue] = useState("");
  const [spawning, setSpawning] = useState(false);
  const [spawnTask, setSpawnTask] = useState("");

  const submit = async () => {
    const content = value.trim();
    if (!content || busy) return;
    setValue("");
    await onSend(content);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  const submitSpawn = async () => {
    const task = spawnTask.trim();
    if (!task) return;
    setSpawnTask("");
    setSpawning(false);
    await onSpawn(task);
  };

  return (
    <div className="border-t border-bao-border bg-bao-card/60 p-3">
      {spawning && (
        <div className="mb-2 rounded-xl border border-bao-border bg-bao-card-soft p-3">
          <label className="mb-1 block text-xs font-medium text-bao-muted">
            Spawn helper task
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={spawnTask}
              onChange={(e) => setSpawnTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void submitSpawn()}
              placeholder="Inspect the project structure"
              className="flex-1 rounded-xl border border-bao-border bg-bao-card px-3 py-2 text-sm focus:border-bao-chili focus:outline-none focus:ring-2 focus:ring-bao-ring/40"
            />
            <Button size="sm" onClick={submitSpawn} disabled={busy}>
              Spawn
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSpawning(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Message Bao…  (⌘/Ctrl + Enter to send)"
          className="bao-scroll flex-1 resize-none rounded-xl border border-bao-border bg-bao-card px-3 py-2 text-sm focus:border-bao-chili focus:outline-none focus:ring-2 focus:ring-bao-ring/40"
        />
        <div className="flex flex-col gap-2">
          <Button onClick={submit} disabled={busy || !value.trim()}>
            Send
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRun}
              disabled={busy}
              title="Run a one-shot agent step"
            >
              Run
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSpawning((s) => !s)}
              disabled={busy}
            >
              Spawn helper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
