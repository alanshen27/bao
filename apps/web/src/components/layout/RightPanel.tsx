import { AgentStatusCard } from "../agents/AgentStatusCard";
import { UsageCrumbs } from "../bao/UsageCrumbs";
import { ChildAgentList } from "../agents/ChildAgentList";
import { EventTimeline } from "../agents/EventTimeline";
import { ToolCallList } from "../agents/ToolCallList";
import type { SessionDetailDto } from "../../lib/types";

export function RightPanel({
  detail,
  budgetCapUsd,
}: {
  detail: SessionDetailDto;
  budgetCapUsd?: number;
}) {
  return (
    <div className="bao-scroll h-full w-full space-y-3 overflow-y-auto border-l border-bao-border bg-bao-bg/50 p-3 lg:w-[340px]">
      <AgentStatusCard session={detail.session} />
      <UsageCrumbs usage={detail.usage} budgetCapUsd={budgetCapUsd} />
      <ChildAgentList
        parentCode={detail.session.code}
        children={detail.children}
      />
      <ToolCallList toolCalls={detail.toolCalls} />
      <EventTimeline events={detail.events} />
    </div>
  );
}
