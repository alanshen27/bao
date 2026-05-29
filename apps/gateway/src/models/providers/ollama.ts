import { approximateTokens } from "../../sessions/usage.js";
import type { ChatInput, ChatResult, ModelProvider } from "../types.js";

interface OllamaTagsResponse {
  models?: { name?: string }[];
}

interface OllamaChatResponse {
  message?: { content?: string };
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Local Ollama provider. Requires no cloud key — it is "configured" whenever
 * a base URL is set (the default points at a local Ollama instance).
 */
export class OllamaProvider implements ModelProvider {
  id = "ollama";
  name = "Ollama";
  kind = "local" as const;

  constructor(private readonly getBaseUrl: () => string) {}

  async isConfigured(): Promise<boolean> {
    return this.getBaseUrl().trim().length > 0;
  }

  async listModels(): Promise<string[]> {
    const baseUrl = this.getBaseUrl().replace(/\/$/, "");
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) return [];
      const data = (await response.json()) as OllamaTagsResponse;
      return (data.models ?? [])
        .map((m) => m.name)
        .filter((name): name is string => Boolean(name));
    } catch {
      // Ollama may not be running; return no models rather than throwing.
      return [];
    }
  }

  async chat(input: ChatInput): Promise<ChatResult> {
    const baseUrl = this.getBaseUrl().replace(/\/$/, "");
    const model = input.model ?? "llama3.2";

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: input.messages,
        stream: false,
        options: { temperature: input.temperature ?? 0.7 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content ?? "";
    const inputTokens =
      data.prompt_eval_count ??
      approximateTokens(input.messages.map((m) => m.content).join("\n"));
    const outputTokens = data.eval_count ?? approximateTokens(content);

    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUsd: 0,
    };
  }
}
