import type {
  ChatRole,
  MessageDto,
  SessionStatus,
  ToolCallDto,
} from "@bao/shared";
import { wsHub } from "../ws/hub.js";
import {
  addEvent,
  addMessage,
  addToolCall,
  addUsage,
  countChildren,
  getSessionById,
  toMessageDto,
  toSessionDto,
  toToolCallDto,
  toUsageDto,
  updateSessionStatus,
  updateToolCall,
} from "../db/repositories.js";

export interface SessionRef {
  id: string;
  code: string;
}

export async function recordMessage(
  session: SessionRef,
  role: ChatRole,
  content: string,
): Promise<MessageDto> {
  const message = toMessageDto(await addMessage(session.id, role, content));
  wsHub.broadcast({
    type: "message.created",
    sessionCode: session.code,
    message,
  });
  return message;
}

export async function recordEvent(
  session: SessionRef,
  type: string,
  message: string,
  data?: unknown,
): Promise<void> {
  const event = await addEvent(session.id, type, message, data);
  wsHub.broadcast({
    type: "event.created",
    sessionCode: session.code,
    event: {
      id: event.id,
      sessionId: event.sessionId,
      type: event.type,
      message: event.message,
      data: event.data ?? null,
      createdAt: event.createdAt.toISOString(),
    },
  });
}

export async function recordUsage(
  session: SessionRef,
  data: {
    providerId: string;
    modelId?: string | null;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  },
): Promise<void> {
  const usage = toUsageDto(
    await addUsage({ sessionId: session.id, ...data }),
  );
  wsHub.broadcast({
    type: "usage.created",
    sessionCode: session.code,
    usage,
  });
}

export async function startToolCall(
  session: SessionRef,
  toolName: string,
  input: unknown,
): Promise<ToolCallDto> {
  const toolCall = toToolCallDto(
    await addToolCall(session.id, toolName, input),
  );
  wsHub.broadcast({
    type: "toolcall.created",
    sessionCode: session.code,
    toolCall,
  });
  return toolCall;
}

export async function finishToolCall(
  session: SessionRef,
  id: string,
  patch: { status: "completed" | "failed"; output?: unknown; error?: string | null },
): Promise<ToolCallDto> {
  const toolCall = toToolCallDto(await updateToolCall(id, patch));
  wsHub.broadcast({
    type: "toolcall.updated",
    sessionCode: session.code,
    toolCall,
  });
  return toolCall;
}

export async function setSessionStatus(
  session: SessionRef,
  status: SessionStatus,
): Promise<void> {
  await updateSessionStatus(session.id, status);
  await broadcastSessionUpdate(session.id);
}

export async function broadcastSessionUpdate(sessionId: string): Promise<void> {
  const updated = await getSessionById(sessionId);
  if (!updated) return;
  const childCount = await countChildren(sessionId);
  wsHub.broadcast({
    type: "session.updated",
    session: toSessionDto(updated, childCount),
  });
}
