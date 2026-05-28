import type {
  SessionDetailDto,
  SessionDto,
  SessionKind,
} from "@bao/shared";
import { loadConfig } from "../config/config.js";
import { modelRegistry, pluginRegistry, wsHub } from "../runtime.js";
import {
  AGENT_SYSTEM_PROMPT,
  runAgent,
  runChat,
} from "../agents/runner.js";
import { spawnSubagent } from "../agents/spawn.js";
import {
  countChildren,
  createSession,
  getSessionByCode,
  listChildren,
  listEvents,
  listMessages,
  listSessions,
  listToolCalls,
  getUsageSummary,
  recentMessages,
  toEventDto,
  toMessageDto,
  toSessionDto,
  toToolCallDto,
} from "../db/repositories.js";
import { badRequest, notFound, toErrorMessage } from "../utils/errors.js";
import {
  broadcastSessionUpdate,
  recordEvent,
  recordMessage,
  setSessionStatus,
  type SessionRef,
} from "./io.js";

export interface CreateSessionParams {
  title?: string;
  kind: SessionKind;
  providerId?: string;
  modelId?: string;
}

function resolveProviderModel(
  providerId: string | undefined,
  modelId: string | undefined,
): { providerId: string; modelId: string | null } {
  const config = loadConfig();
  const resolvedProvider = providerId ?? config.defaultProvider;
  if (!modelRegistry.has(resolvedProvider)) {
    throw badRequest(`Unknown provider: ${resolvedProvider}`);
  }
  const resolvedModel =
    modelId ??
    (resolvedProvider === config.defaultProvider ? config.defaultModel : null);
  return { providerId: resolvedProvider, modelId: resolvedModel };
}

export async function createNewSession(
  params: CreateSessionParams,
): Promise<SessionDto> {
  const { providerId, modelId } = resolveProviderModel(
    params.providerId,
    params.modelId,
  );
  const session = await createSession({
    title: params.title ?? null,
    kind: params.kind,
    status: "idle",
    providerId,
    modelId,
  });
  const dto = toSessionDto(session, 0);
  wsHub.broadcast({ type: "session.created", session: dto });
  return dto;
}

export async function getSessions(): Promise<SessionDto[]> {
  return listSessions();
}

export async function getSessionDetail(
  code: string,
): Promise<SessionDetailDto> {
  const session = await getSessionByCode(code);
  if (!session) throw notFound(`Session "${code}" not found`);

  const [messages, children, events, usage, toolCalls, childCount] =
    await Promise.all([
      listMessages(session.id),
      listChildren(session.id),
      listEvents(session.id),
      getUsageSummary(session.id),
      listToolCalls(session.id),
      countChildren(session.id),
    ]);

  return {
    session: toSessionDto(session, childCount),
    messages: messages.map(toMessageDto),
    children,
    events: events.map(toEventDto),
    usage,
    toolCalls: toolCalls.map(toToolCallDto),
  };
}

async function requireSessionRef(code: string): Promise<SessionRef & {
  providerId: string;
  modelId: string | null;
}> {
  const session = await getSessionByCode(code);
  if (!session) throw notFound(`Session "${code}" not found`);
  return {
    id: session.id,
    code: session.code,
    providerId: session.providerId,
    modelId: session.modelId,
  };
}

export async function sendMessage(code: string, content: string): Promise<void> {
  const session = await requireSessionRef(code);

  await recordMessage(session, "user", content);
  await recordEvent(session, "message.received", "Message received");
  await broadcastSessionUpdate(session.id);

  const provider = modelRegistry.get(session.providerId);
  const history = await recentMessages(session.id);

  try {
    await runChat(session, provider, session.modelId ?? undefined, history);
    await recordEvent(session, "message.completed", "Assistant replied");
  } catch (error) {
    const message = toErrorMessage(error);
    await recordEvent(session, "message.failed", `Reply failed: ${message}`);
    throw error;
  } finally {
    await broadcastSessionUpdate(session.id);
  }
}

export async function runSession(code: string): Promise<void> {
  const session = await requireSessionRef(code);
  const config = loadConfig();
  const provider = modelRegistry.get(session.providerId);

  await setSessionStatus(session, "running");
  await recordEvent(session, "agent.started", "Agent run started");

  try {
    await runAgent({
      session,
      provider,
      model: session.modelId ?? undefined,
      config,
      pluginRegistry,
      systemPrompt: AGENT_SYSTEM_PROMPT,
    });
    await setSessionStatus(session, "completed");
    await recordEvent(session, "agent.completed", "Agent run completed");
  } catch (error) {
    const message = toErrorMessage(error);
    await recordEvent(session, "agent.failed", `Agent run failed: ${message}`);
    await setSessionStatus(session, "failed");
    throw error;
  }
}

export async function spawnHelper(
  code: string,
  task: string,
  providerId?: string,
  modelId?: string,
): Promise<SessionDto> {
  const parent = await requireSessionRef(code);
  const config = loadConfig();
  return spawnSubagent({
    parent,
    task,
    providerId,
    modelId,
    config,
    modelRegistry,
    pluginRegistry,
  });
}
