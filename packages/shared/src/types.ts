// Shared domain types used by both the gateway and the web UI.

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type SessionKind = "chat" | "agent" | "subagent";

export type SessionStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "paused";

export type ProviderKind = "cloud" | "local" | "mock";

export type ToolCallStatus = "running" | "completed" | "failed";

export interface SessionDto {
  id: string;
  code: string;
  title: string | null;
  kind: SessionKind;
  status: SessionStatus;
  providerId: string;
  modelId: string | null;
  parentId: string | null;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface EventDto {
  id: string;
  sessionId: string;
  type: string;
  message: string;
  data: unknown;
  createdAt: string;
}

export interface UsageDto {
  id: string;
  sessionId: string;
  providerId: string;
  modelId: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  createdAt: string;
}

export interface UsageSummaryDto {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ToolCallDto {
  id: string;
  sessionId: string;
  toolName: string;
  input: unknown;
  output: unknown;
  status: ToolCallStatus;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SessionDetailDto {
  session: SessionDto;
  messages: MessageDto[];
  children: SessionDto[];
  events: EventDto[];
  usage: UsageSummaryDto;
  toolCalls: ToolCallDto[];
}

export interface ProviderDto {
  id: string;
  name: string;
  kind: ProviderKind;
  configured: boolean;
  models: string[];
}

export interface ToolDto {
  name: string;
  description: string;
  pluginId: string;
  pluginName: string;
}

export interface PluginDto {
  id: string;
  name: string;
  description?: string;
  tools: ToolDto[];
}

export interface ToolConfig {
  enabled: boolean;
}

export interface BaoConfig {
  version: string;
  gateway: {
    host: string;
    port: number;
  };
  defaultProvider: string;
  defaultModel: string;
  budgetCapUsd: number;
  onboardingCompleted: boolean;
  tools: {
    filesystem: ToolConfig;
    shell: ToolConfig;
    memory: ToolConfig;
  };
}

export interface SetupStatusDto {
  onboardingCompleted: boolean;
  configExists: boolean;
  secretsExists: boolean;
}

export type BaoWsEvent =
  | { type: "session.created"; session: SessionDto }
  | { type: "session.updated"; session: SessionDto }
  | { type: "message.created"; sessionCode: string; message: MessageDto }
  | { type: "event.created"; sessionCode: string; event: EventDto }
  | { type: "usage.created"; sessionCode: string; usage: UsageDto }
  | { type: "toolcall.created"; sessionCode: string; toolCall: ToolCallDto }
  | { type: "toolcall.updated"; sessionCode: string; toolCall: ToolCallDto };
