import { Card, CardHeader } from "../ui/Card";
import { cn } from "../../lib/cn";
import { formatTime } from "../../lib/format";
import type { EventDto } from "../../lib/types";

function dotColor(type: string): string {
  if (type.includes("failed") || type.includes("blocked")) return "bg-bao-danger";
  if (type.includes("completed")) return "bg-bao-scallion";
  if (type.includes("started") || type.includes("running") || type.includes("called"))
    return "bg-bao-chili";
  return "bg-bao-bamboo";
}

export function EventTimeline({ events }: { events: EventDto[] }) {
  const ordered = [...events].reverse();
  return (
    <Card>
      <CardHeader title="Event timeline" subtitle="What Bao has been up to" />
      <div className="bao-scroll max-h-72 overflow-y-auto px-4 py-3">
        {ordered.length === 0 ? (
          <p className="py-4 text-center text-sm text-bao-muted">
            No events yet.
          </p>
        ) : (
          <ol className="relative space-y-3 pl-4">
            <span className="absolute bottom-1 left-[3px] top-1 w-px bg-bao-border" />
            {ordered.map((event) => (
              <li key={event.id} className="relative animate-fade-in">
                <span
                  className={cn(
                    "absolute -left-4 top-1 h-2 w-2 rounded-full",
                    dotColor(event.type),
                  )}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-bao-muted">
                    {event.type}
                  </span>
                  <span className="text-[11px] text-bao-muted">
                    {formatTime(event.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-bao-text">{event.message}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}
