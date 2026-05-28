import { Link, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { MessageBubble } from "../components/chat/MessageBubble";
import { EventTimeline } from "../components/agents/EventTimeline";
import { ToolCallList } from "../components/agents/ToolCallList";
import { UsageCrumbs } from "../components/bao/UsageCrumbs";
import { Card } from "../components/ui/Card";
import { useSessionDetail } from "../hooks/useSessionDetail";

export function AgentDetail() {
  const { code, childCode } = useParams<{
    code: string;
    childCode: string;
  }>();
  const { detail, loading, error } = useSessionDetail(childCode);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-bao-muted">
        Loading helper…
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-bao-muted">
        <p className="font-display text-lg text-bao-soy">Helper not found</p>
        <p className="text-sm">{error ?? "This little bao wandered off."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-bao-border bg-bao-card/60 px-4 py-2">
        <Link
          to={`/session/${code}`}
          className="text-sm text-bao-chili hover:underline"
        >
          ← Back to parent {code}
        </Link>
      </div>
      <Header session={detail.session} />
      <div className="bao-scroll grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="mb-2 font-display text-sm font-semibold text-bao-soy">
              Conversation
            </h3>
            <div className="space-y-3">
              {detail.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {detail.messages.length === 0 && (
                <p className="text-sm text-bao-muted">No messages.</p>
              )}
            </div>
          </Card>
        </div>
        <div className="space-y-3">
          <UsageCrumbs usage={detail.usage} />
          <ToolCallList toolCalls={detail.toolCalls} />
          <EventTimeline events={detail.events} />
        </div>
      </div>
    </div>
  );
}
