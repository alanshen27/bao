import { OpenAICompatibleProvider } from "./openai-compatible.js";

export function createDeepSeekProvider(options: {
  getApiKey: () => string;
  getBaseUrl: () => string;
}): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    id: "deepseek",
    name: "DeepSeek",
    kind: "cloud",
    defaultModels: ["deepseek-chat", "deepseek-reasoner"],
    getApiKey: options.getApiKey,
    getBaseUrl: options.getBaseUrl,
  });
}
