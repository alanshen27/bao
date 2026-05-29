import type { BaoConfig } from "@bao/shared";
import type { PluginRegistry } from "../plugins/index.js";
import type { ChatMessage, ModelProvider } from "../models/types.js";
import { recentMessages } from "../db/repositories.js";
import { normalizeUsage } from "../sessions/usage.js";
import { extractToolCall } from "../utils/json.js";
import {
  recordEvent,
  recordMessage,
  recordUsage,
  type SessionRef,
} from "../sessions/io.js";
import { executeParsedTool } from "./tool-loop.js";

export const AGENT_SYSTEM_PROMPT = `You are Bao, a local-first AI agent helper.

You can answer directly or request one tool call by outputting a JSON object:
{"tool":"tool_name","input":{...}}

Only request a tool when it is clearly needed.
Be concise and practical.`;

export function subagentPrompt(task: string): string {
  return `You are a Bao subagent.

You were spawned to complete this specific task:
${task}

Work independently but briefly.
If you need local context, request a tool call using JSON:
{"tool":"read_file","input":{"path":"package.json"}}

Do not loop forever.
Return a concise result that can be shown to the parent session.`;
}

function toChatMessages(
  messages: { role: string; content: string }[],
): ChatMessage[] {
  return messages.map((m) => ({
    role: m.role as ChatMessage["role"],
    content: m.content,
  }));
}

/** Normal chat: a single model call with recent history. No tool loop. */
export async function runChat(
  session: SessionRef,
  provider: ModelProvider,
  model: string | undefined,
  history: { role: string; content: string }[],
): Promise<string> {
  const messages = toChatMessages(history);
  const result = await provider.chat({ model, messages });
  await recordMessage(session, "assistant", result.content);
  const usage = normalizeUsage(
    result,
    model,
    messages.map((m) => m.content).join("\n"),
  );
  await recordUsage(session, {
    providerId: provider.id,
    modelId: model ?? null,
    ...usage,
  });
  return result.content;
}

export interface AgentRunOptions {
  session: SessionRef;
  provider: ModelProvider;
  model: string | undefined;
  config: BaoConfig;
  pluginRegistry: PluginRegistry;
  systemPrompt: string;
  maxToolCalls?: number;
}

/**
 * One-shot agent run with a bounded tool loop (max 2 tool calls by default).
 * Persists every assistant message, tool call, event, and usage row, and
 * broadcasts them over WebSocket.
 */
export async function runAgent(options: AgentRunOptions): Promise<string> {
  const {
    session,
    provider,
    model,
    config,
    pluginRegistry,
    systemPrompt,
    maxToolCalls = 2,
  } = options;

  const history = await recentMessages(session.id);
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...toChatMessages(history.filter((m) => m.role !== "system")),
  ];

  let lastContent = "";
  let toolCalls = 0;

  for (;;) {
    const result = await provider.chat({ model, messages });
    lastContent = result.content;
    await recordMessage(session, "assistant", result.content);
    const usage = normalizeUsage(
      result,
      model,
      messages.map((m) => m.content).join("\n"),
    );
    await recordUsage(session, {
      providerId: provider.id,
      modelId: model ?? null,
      ...usage,
    });

    const parsed = extractToolCall(result.content);
    if (!parsed) break;
    if (toolCalls >= maxToolCalls) {
      await recordEvent(
        session,
        "agent.tool_limit",
        "Reached the maximum number of tool calls for this run.",
      );
      break;
    }

    toolCalls += 1;
    const execution = await executeParsedTool(
      parsed,
      session,
      config,
      pluginRegistry,
    );
    // Persist as a tool message for the UI, but feed it back to the model as a
    // user turn so cloud providers accept the conversation shape.
    await recordMessage(session, "tool", execution.resultText);
    messages.push({ role: "assistant", content: result.content });
    messages.push({
      role: "user",
      content: `Result of ${execution.toolName}:\n${execution.resultText}`,
    });
  }

  return lastContent;
}
