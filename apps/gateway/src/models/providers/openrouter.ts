import { OpenAICompatibleProvider } from "./openai-compatible.js";

export function createOpenRouterProvider(options: {
  getApiKey: () => string;
  getBaseUrl: () => string;
}): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    id: "openrouter",
    name: "OpenRouter",
    kind: "cloud",
    defaultModels: [
      "openai/gpt-4.1-mini",
      "anthropic/claude-3.5-sonnet",
      "deepseek/deepseek-chat",
    ],
    getApiKey: options.getApiKey,
    getBaseUrl: options.getBaseUrl,
  });
}
