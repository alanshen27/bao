import { estimateCostUsd } from "../../sessions/usage.js";
import type {
  ChatInput,
  ChatResult,
  ModelProvider,
  ProviderKind,
} from "../types.js";

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface OpenAICompatibleOptions {
  id: string;
  name: string;
  kind?: ProviderKind;
  defaultModels: string[];
  getApiKey: () => string;
  getBaseUrl: () => string;
}

/**
 * Reusable provider for any service that speaks the OpenAI chat-completions
 * protocol (DeepSeek, OpenRouter, and friends).
 */
export class OpenAICompatibleProvider implements ModelProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  private defaultModels: string[];
  private getApiKey: () => string;
  private getBaseUrl: () => string;

  constructor(options: OpenAICompatibleOptions) {
    this.id = options.id;
    this.name = options.name;
    this.kind = options.kind ?? "cloud";
    this.defaultModels = options.defaultModels;
    this.getApiKey = options.getApiKey;
    this.getBaseUrl = options.getBaseUrl;
  }

  async isConfigured(): Promise<boolean> {
    return this.getApiKey().trim().length > 0;
  }

  async listModels(): Promise<string[]> {
    return this.defaultModels;
  }

  async chat(input: ChatInput): Promise<ChatResult> {
    const apiKey = this.getApiKey().trim();
    if (!apiKey) {
      throw new Error(
        `${this.name} API key is not configured. Add it in Settings.`,
      );
    }
    const baseUrl = this.getBaseUrl().replace(/\/$/, "");
    const model = input.model ?? this.defaultModels[0];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: input.messages,
        temperature: input.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `${this.name} request failed (${response.status}): ${text}`,
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const content = data.choices?.[0]?.message?.content ?? "";
    const inputTokens = data.usage?.prompt_tokens;
    const outputTokens = data.usage?.completion_tokens;

    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: data.usage?.total_tokens,
      estimatedCostUsd:
        inputTokens !== undefined && outputTokens !== undefined
          ? estimateCostUsd(model, inputTokens, outputTokens)
          : undefined,
    };
  }
}
