import { Badge } from "../ui/Badge";

export function ProviderPill({
  providerId,
  modelId,
}: {
  providerId: string;
  modelId?: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge tone="neutral">{providerId}</Badge>
      {modelId && (
        <span className="font-mono text-xs text-bao-muted">{modelId}</span>
      )}
    </span>
  );
}
