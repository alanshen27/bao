import type { ChatRole, ProviderKind } from "@bao/shared";

export type { ChatRole, ProviderKind };

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResult {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export interface ChatInput {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}

export interface ModelProvider {
  id: string;
  name: string;
  kind: ProviderKind;

  isConfigured(): Promise<boolean>;

  listModels(): Promise<string[]>;

  chat(input: ChatInput): Promise<ChatResult>;
}
