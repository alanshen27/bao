import { Badge } from "../ui/Badge";
import type { SessionKind, SessionStatus } from "../../lib/types";

const STATUS_TONE: Record<
  SessionStatus,
  "running" | "completed" | "failed" | "paused" | "neutral"
> = {
  running: "running",
  completed: "completed",
  failed: "failed",
  paused: "paused",
  idle: "neutral",
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} pulse={status === "running"}>
      {status}
    </Badge>
  );
}

export function KindBadge({ kind }: { kind: SessionKind }) {
  return <Badge tone="mono">{kind}</Badge>;
}

export function ServedLocally() {
  return (
    <Badge tone="local">
      <span aria-hidden>🥟</span> served locally
    </Badge>
  );
}
