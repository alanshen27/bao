import type { BaoConfig } from "@bao/shared";
import { baoConfigSchema, baoSecretsSchema } from "@bao/shared";
import type { BaoSecrets } from "@bao/shared";

export { baoConfigSchema, baoSecretsSchema };
export type { BaoConfig, BaoSecrets };

export const defaultConfig: BaoConfig = {
  version: "0.1.0",
  gateway: {
    host: "127.0.0.1",
    port: 3820,
  },
  defaultProvider: "mock",
  defaultModel: "mock-small",
  budgetCapUsd: 5,
  onboardingCompleted: false,
  tools: {
    filesystem: { enabled: true },
    shell: { enabled: false },
    memory: { enabled: true },
  },
};

export const defaultSecrets: BaoSecrets = {
  openai: { apiKey: "" },
  anthropic: { apiKey: "" },
  deepseek: { apiKey: "", baseUrl: "https://api.deepseek.com" },
  openrouter: { apiKey: "", baseUrl: "https://openrouter.ai/api/v1" },
  ollama: { baseUrl: "http://localhost:11434" },
};
