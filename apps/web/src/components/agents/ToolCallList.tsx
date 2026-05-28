import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatTime } from "../../lib/format";
import type { ToolCallDto } from "../../lib/types";

function tone(status: ToolCallDto["status"]) {
  if (status === "completed") return "completed" as const;
  if (status === "failed") return "failed" as const;
  return "running" as const;
}

export function ToolCallList({ toolCalls }: { toolCalls: ToolCallDto[] }) {
  if (toolCalls.length === 0) return null;
  const ordered = [...toolCalls].reverse();

  return (
    <Card>
      <CardHeader
        title="Tool calls"
        right={<Badge tone="mono">{toolCalls.length}</Badge>}
      />
      <div className="bao-scroll max-h-72 space-y-2 overflow-y-auto px-3 py-3">
        {ordered.map((call) => (
          <div
            key={call.id}
            className="animate-fade-in rounded-xl border border-bao-border bg-bao-card-soft px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-bao-soy">
                {call.toolName}
              </span>
              <Badge tone={tone(call.status)} pulse={call.status === "running"}>
                {call.status}
              </Badge>
            </div>
            <pre className="bao-scroll mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-bao-muted">
              {JSON.stringify(call.input)}
            </pre>
            {call.error && (
              <p className="mt-1 text-xs text-bao-danger">{call.error}</p>
            )}
            <div className="mt-1 text-right text-[11px] text-bao-muted">
              {formatTime(call.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
