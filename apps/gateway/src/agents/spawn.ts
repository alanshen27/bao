import type { BaoConfig, SessionDto } from "@bao/shared";
import type { ModelRegistry } from "../models/index.js";
import type { PluginRegistry } from "../plugins/index.js";
import { wsHub } from "../ws/hub.js";
import {
  countChildren,
  createSession,
  getSessionById,
  toSessionDto,
  type CreateSessionInput,
} from "../db/repositories.js";
import { toErrorMessage } from "../utils/errors.js";
import {
  broadcastSessionUpdate,
  recordEvent,
  recordMessage,
  setSessionStatus,
  type SessionRef,
} from "../sessions/io.js";
import { runAgent, subagentPrompt } from "./runner.js";

export interface SpawnOptions {
  parent: { id: string; code: string; providerId: string; modelId: string | null };
  task: string;
  providerId?: string;
  modelId?: string;
  config: BaoConfig;
  modelRegistry: ModelRegistry;
  pluginRegistry: PluginRegistry;
}

function titleFromTask(task: string): string {
  const trimmed = task.trim();
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed;
}

export async function spawnSubagent(options: SpawnOptions): Promise<SessionDto> {
  const { parent, task, config, modelRegistry, pluginRegistry } = options;
  const providerId = options.providerId ?? parent.providerId;
  const modelId = options.modelId ?? parent.modelId ?? undefined;

  const input: CreateSessionInput = {
    title: titleFromTask(task),
    kind: "subagent",
    status: "running",
    providerId,
    modelId: modelId ?? null,
    parentId: parent.id,
  };
  const child = await createSession(input);
  const childRef: SessionRef = { id: child.id, code: child.code };

  wsHub.broadcast({ type: "session.created", session: toSessionDto(child, 0) });
  await broadcastSessionUpdate(parent.id);

  await recordEvent(
    { id: parent.id, code: parent.code },
    "subagent.spawned",
    `Spawned helper ${child.code}: ${titleFromTask(task)}`,
    { childCode: child.code, task },
  );
  await recordEvent(childRef, "agent.started", "Subagent started", { task });
  await recordMessage(childRef, "user", task);

  try {
    const provider = modelRegistry.get(providerId);
    await runAgent({
      session: childRef,
      provider,
      model: modelId,
      config,
      pluginRegistry,
      systemPrompt: subagentPrompt(task),
    });
    await setSessionStatus(childRef, "completed");
    await recordEvent(childRef, "agent.completed", "Subagent completed");
  } catch (error) {
    const message = toErrorMessage(error);
    await recordEvent(childRef, "agent.failed", `Subagent failed: ${message}`);
    await setSessionStatus(childRef, "failed");
  }

  const refreshed = await getSessionById(child.id);
  const childCount = await countChildren(child.id);
  return toSessionDto(refreshed ?? child, childCount);
}
