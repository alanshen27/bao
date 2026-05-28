import { estimateCostUsd } from "../../sessions/usage.js";
import type { ChatInput, ChatMessage, ChatResult, ModelProvider } from "../types.js";

const DEFAULT_MODELS = ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"];

interface AnthropicResponse {
  content?: { type: string; text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

export class AnthropicProvider implements ModelProvider {
  id = "anthropic";
  name = "Anthropic";
  kind = "cloud" as const;

  constructor(private readonly getApiKey: () => string) {}

  async isConfigured(): Promise<boolean> {
    return this.getApiKey().trim().length > 0;
  }

  async listModels(): Promise<string[]> {
    return DEFAULT_MODELS;
  }

  async chat(input: ChatInput): Promise<ChatResult> {
    const apiKey = this.getApiKey().trim();
    if (!apiKey) {
      throw new Error(
        "Anthropic API key is not configured. Add it in Settings.",
      );
    }
    const model = input.model ?? DEFAULT_MODELS[0];

    // Anthropic keeps the system prompt separate from the message list.
    const system = input.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const messages = input.messages
      .filter((m): m is ChatMessage => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        system: system || undefined,
        messages,
        max_tokens: 1024,
        temperature: input.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    const content =
      data.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("") ?? "";
    const inputTokens = data.usage?.input_tokens;
    const outputTokens = data.usage?.output_tokens;

    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens:
        inputTokens !== undefined && outputTokens !== undefined
          ? inputTokens + outputTokens
          : undefined,
      estimatedCostUsd:
        inputTokens !== undefined && outputTokens !== undefined
          ? estimateCostUsd(model, inputTokens, outputTokens)
          : undefined,
    };
  }
}
