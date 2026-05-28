import type { BaoConfig } from "@bao/shared";
import { projectCwd } from "../config/paths.js";
import { isToolEnabled, type PluginRegistry } from "../plugins/index.js";
import type { ToolContext } from "../plugins/types.js";
import { toErrorMessage } from "../utils/errors.js";
import type { ParsedToolCall } from "../utils/json.js";
import {
  finishToolCall,
  recordEvent,
  startToolCall,
  type SessionRef,
} from "../sessions/io.js";

export interface ToolExecutionResult {
  ok: boolean;
  toolName: string;
  resultText: string;
}

/**
 * Execute a single parsed tool call: validate it is enabled, persist a
 * ToolCall row, emit events, run the tool, and return a text summary suitable
 * for feeding back into the model.
 */
export async function executeParsedTool(
  parsed: ParsedToolCall,
  session: SessionRef,
  config: BaoConfig,
  pluginRegistry: PluginRegistry,
): Promise<ToolExecutionResult> {
  const tool = pluginRegistry.getTool(parsed.tool);

  if (!tool) {
    await recordEvent(
      session,
      "tool.unknown",
      `Requested unknown tool: ${parsed.tool}`,
      { tool: parsed.tool },
    );
    return {
      ok: false,
      toolName: parsed.tool,
      resultText: `Tool "${parsed.tool}" is not available.`,
    };
  }

  if (!isToolEnabled(config, parsed.tool)) {
    await recordEvent(
      session,
      "tool.disabled",
      `Tool "${parsed.tool}" is disabled in settings`,
      { tool: parsed.tool },
    );
    return {
      ok: false,
      toolName: parsed.tool,
      resultText: `Tool "${parsed.tool}" is disabled in settings.`,
    };
  }

  const record = await startToolCall(session, parsed.tool, parsed.input);
  await recordEvent(session, "tool.called", `Calling ${parsed.tool}`, {
    tool: parsed.tool,
    input: parsed.input,
  });

  const ctx: ToolContext = {
    cwd: projectCwd,
    sessionId: session.id,
    sessionCode: session.code,
    emitEvent: (type, message, data) => recordEvent(session, type, message, data),
  };

  try {
    const output = await tool.execute(parsed.input, ctx);
    await finishToolCall(session, record.id, {
      status: "completed",
      output,
    });
    await recordEvent(session, "tool.completed", `Completed ${parsed.tool}`, {
      tool: parsed.tool,
    });
    return {
      ok: true,
      toolName: parsed.tool,
      resultText: JSON.stringify(output).slice(0, 4000),
    };
  } catch (error) {
    const message = toErrorMessage(error);
    await finishToolCall(session, record.id, {
      status: "failed",
      error: message,
    });
    await recordEvent(session, "tool.failed", `Failed ${parsed.tool}: ${message}`, {
      tool: parsed.tool,
      error: message,
    });
    return {
      ok: false,
      toolName: parsed.tool,
      resultText: `Tool "${parsed.tool}" failed: ${message}`,
    };
  }
}
