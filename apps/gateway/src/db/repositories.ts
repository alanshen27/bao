import type {
  EventDto,
  MessageDto,
  SessionDto,
  SessionKind,
  SessionStatus,
  ToolCallDto,
  ToolCallStatus,
  UsageDto,
  UsageSummaryDto,
} from "@bao/shared";
import { prisma } from "./prisma.js";
import { generateUniqueSessionCode } from "../sessions/codes.js";

type PrismaSession = Awaited<ReturnType<typeof prisma.session.findFirstOrThrow>>;
type PrismaMessage = Awaited<ReturnType<typeof prisma.message.findFirstOrThrow>>;
type PrismaEvent = Awaited<ReturnType<typeof prisma.event.findFirstOrThrow>>;
type PrismaUsage = Awaited<ReturnType<typeof prisma.usage.findFirstOrThrow>>;
type PrismaToolCall = Awaited<
  ReturnType<typeof prisma.toolCall.findFirstOrThrow>
>;

export function toSessionDto(
  session: PrismaSession,
  childCount = 0,
): SessionDto {
  return {
    id: session.id,
    code: session.code,
    title: session.title,
    kind: session.kind as SessionKind,
    status: session.status as SessionStatus,
    providerId: session.providerId,
    modelId: session.modelId,
    parentId: session.parentId,
    childCount,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function toMessageDto(message: PrismaMessage): MessageDto {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role as MessageDto["role"],
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

function parseJson(value: string | null): unknown {
  if (value === null) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export function toEventDto(event: PrismaEvent): EventDto {
  return {
    id: event.id,
    sessionId: event.sessionId,
    type: event.type,
    message: event.message,
    data: parseJson(event.data),
    createdAt: event.createdAt.toISOString(),
  };
}

export function toUsageDto(usage: PrismaUsage): UsageDto {
  return {
    id: usage.id,
    sessionId: usage.sessionId,
    providerId: usage.providerId,
    modelId: usage.modelId,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    estimatedCostUsd: usage.estimatedCostUsd,
    createdAt: usage.createdAt.toISOString(),
  };
}

export function toToolCallDto(toolCall: PrismaToolCall): ToolCallDto {
  return {
    id: toolCall.id,
    sessionId: toolCall.sessionId,
    toolName: toolCall.toolName,
    input: parseJson(toolCall.inputJson),
    output: parseJson(toolCall.outputJson),
    status: toolCall.status as ToolCallStatus,
    error: toolCall.error,
    createdAt: toolCall.createdAt.toISOString(),
    completedAt: toolCall.completedAt?.toISOString() ?? null,
  };
}

export interface CreateSessionInput {
  title?: string | null;
  kind: SessionKind;
  status?: SessionStatus;
  providerId: string;
  modelId?: string | null;
  parentId?: string | null;
}

export async function createSession(
  input: CreateSessionInput,
): Promise<PrismaSession> {
  const code = await generateUniqueSessionCode(
    async (candidate) =>
      (await prisma.session.count({ where: { code: candidate } })) > 0,
  );
  return prisma.session.create({
    data: {
      code,
      title: input.title ?? null,
      kind: input.kind,
      status: input.status ?? "idle",
      providerId: input.providerId,
      modelId: input.modelId ?? null,
      parentId: input.parentId ?? null,
    },
  });
}

export async function getSessionByCode(
  code: string,
): Promise<PrismaSession | null> {
  return prisma.session.findUnique({ where: { code } });
}

export async function getSessionById(
  id: string,
): Promise<PrismaSession | null> {
  return prisma.session.findUnique({ where: { id } });
}

export async function listSessions(limit = 50): Promise<SessionDto[]> {
  const sessions = await prisma.session.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { _count: { select: { children: true } } },
  });
  return sessions.map((s) => toSessionDto(s, s._count.children));
}

export async function listChildren(parentId: string): Promise<SessionDto[]> {
  const children = await prisma.session.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { children: true } } },
  });
  return children.map((c) => toSessionDto(c, c._count.children));
}

export async function countChildren(parentId: string): Promise<number> {
  return prisma.session.count({ where: { parentId } });
}

export async function updateSessionStatus(
  id: string,
  status: SessionStatus,
): Promise<PrismaSession> {
  return prisma.session.update({ where: { id }, data: { status } });
}

export async function updateSessionTitle(
  id: string,
  title: string,
): Promise<PrismaSession> {
  return prisma.session.update({ where: { id }, data: { title } });
}

export async function touchSession(id: string): Promise<PrismaSession> {
  return prisma.session.update({
    where: { id },
    data: { updatedAt: new Date() },
  });
}

export async function addMessage(
  sessionId: string,
  role: MessageDto["role"],
  content: string,
): Promise<PrismaMessage> {
  return prisma.message.create({ data: { sessionId, role, content } });
}

export async function listMessages(sessionId: string): Promise<PrismaMessage[]> {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function recentMessages(
  sessionId: string,
  limit = 20,
): Promise<PrismaMessage[]> {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return messages.reverse();
}

export async function addEvent(
  sessionId: string,
  type: string,
  message: string,
  data?: unknown,
): Promise<PrismaEvent> {
  return prisma.event.create({
    data: {
      sessionId,
      type,
      message,
      data: data === undefined || data === null ? null : JSON.stringify(data),
    },
  });
}

export async function listEvents(
  sessionId: string,
  limit = 100,
): Promise<PrismaEvent[]> {
  const events = await prisma.event.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return events.reverse();
}

export interface AddUsageInput {
  sessionId: string;
  providerId: string;
  modelId?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export async function addUsage(input: AddUsageInput): Promise<PrismaUsage> {
  return prisma.usage.create({
    data: {
      sessionId: input.sessionId,
      providerId: input.providerId,
      modelId: input.modelId ?? null,
      inputTokens: input.inputTokens ?? 0,
      outputTokens: input.outputTokens ?? 0,
      totalTokens: input.totalTokens ?? 0,
      estimatedCostUsd: input.estimatedCostUsd ?? 0,
    },
  });
}

export async function listUsage(sessionId: string): Promise<PrismaUsage[]> {
  return prisma.usage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUsageSummary(
  sessionId: string,
): Promise<UsageSummaryDto> {
  const result = await prisma.usage.aggregate({
    where: { sessionId },
    _sum: {
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      estimatedCostUsd: true,
    },
  });
  return {
    inputTokens: result._sum.inputTokens ?? 0,
    outputTokens: result._sum.outputTokens ?? 0,
    totalTokens: result._sum.totalTokens ?? 0,
    estimatedCostUsd: result._sum.estimatedCostUsd ?? 0,
  };
}

export async function addToolCall(
  sessionId: string,
  toolName: string,
  input: unknown,
): Promise<PrismaToolCall> {
  return prisma.toolCall.create({
    data: {
      sessionId,
      toolName,
      inputJson: JSON.stringify(input ?? {}),
      status: "running",
    },
  });
}

export async function updateToolCall(
  id: string,
  patch: {
    status: ToolCallStatus;
    output?: unknown;
    error?: string | null;
  },
): Promise<PrismaToolCall> {
  return prisma.toolCall.update({
    where: { id },
    data: {
      status: patch.status,
      outputJson:
        patch.output === undefined || patch.output === null
          ? null
          : JSON.stringify(patch.output),
      error: patch.error ?? null,
      completedAt: new Date(),
    },
  });
}

export async function listToolCalls(
  sessionId: string,
): Promise<PrismaToolCall[]> {
  return prisma.toolCall.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}
