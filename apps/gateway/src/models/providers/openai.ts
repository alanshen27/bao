import { estimateCostUsd } from "../../sessions/usage.js";
import type { ChatInput, ChatResult, ModelProvider } from "../types.js";

const DEFAULT_MODELS = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"];

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenAIProvider implements ModelProvider {
  id = "openai";
  name = "OpenAI";
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
      throw new Error("OpenAI API key is not configured. Add it in Settings.");
    }
    const model = input.model ?? DEFAULT_MODELS[0];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      throw new Error(`OpenAI request failed (${response.status}): ${text}`);
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
