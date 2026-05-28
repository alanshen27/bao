export type {
  BaoConfig,
  BaoWsEvent,
  EventDto,
  MessageDto,
  PluginDto,
  ProviderDto,
  SessionDetailDto,
  SessionDto,
  SessionKind,
  SessionStatus,
  SetupStatusDto,
  ToolCallDto,
  ToolDto,
  UsageSummaryDto,
} from "@bao/shared";

import type { PluginDto, ToolDto } from "@bao/shared";

export interface PluginWithEnabled extends PluginDto {
  enabled: boolean;
}

export interface ToolWithEnabled extends ToolDto {
  enabled: boolean;
}
