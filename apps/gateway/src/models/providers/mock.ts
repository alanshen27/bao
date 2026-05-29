import { approximateTokens } from "../../sessions/usage.js";
import { extractToolCall } from "../../utils/json.js";
import type { ChatInput, ChatResult, ModelProvider } from "../types.js";

const MODELS = ["mock-small", "mock-agent"];

/**
 * The mock provider is always configured and requires no API keys. It echoes
 * a friendly Bao response and, for agent-style prompts that mention tools,
 * can emit a simple fake tool-call plan so the tool loop is demoable offline.
 */
export class MockProvider implements ModelProvider {
  id = "mock";
  name = "Mock";
  kind = "mock" as const;

  async isConfigured(): Promise<boolean> {
    return true;
  }

  async listModels(): Promise<string[]> {
    return MODELS;
  }

  async chat(input: ChatInput): Promise<ChatResult> {
    const lastUser = [...input.messages]
      .reverse()
      .find((m) => m.role === "user");
    const userText = lastUser?.content ?? "";
    const systemText = input.messages.find((m) => m.role === "system")?.content ?? "";
    const toolResult = input.messages.find((m) => m.role === "tool");

    let content: string;

    if (toolResult) {
      // Second pass after a tool result: summarize what we "saw".
      content =
        "Bao mock response: I used a tool and here is a concise summary of the result. " +
        "Everything looks good — wrapped up neatly.";
    } else if (
      shouldAttemptTool(systemText, userText) &&
      !extractToolCall(userText)
    ) {
      const path = guessPath(userText);
      content = `I'll take a quick look first.\n\n{"tool":"read_file","input":{"path":"${path}"}}`;
    } else {
      content = `Bao mock response: I received your message and would process it here.\n\nYou said: "${truncate(userText, 200)}"`;
    }

    const inputTokens = approximateTokens(
      input.messages.map((m) => m.content).join("\n"),
    );
    const outputTokens = approximateTokens(content);

    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUsd: 0,
    };
  }
}

function shouldAttemptTool(systemText: string, userText: string): boolean {
  const haystack = `${systemText} ${userText}`.toLowerCase();
  return (
    haystack.includes("tool") ||
    haystack.includes("read") ||
    haystack.includes("inspect") ||
    haystack.includes("file") ||
    haystack.includes("project structure")
  );
}

function guessPath(userText: string): string {
  const match = userText.match(/([\w./-]+\.(?:json|ts|tsx|js|md|txt))/);
  return match ? match[1] : "package.json";
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
