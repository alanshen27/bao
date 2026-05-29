import { loadSecrets } from "../config/secrets.js";
import { MockProvider } from "./providers/mock.js";
import { OpenAIProvider } from "./providers/openai.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { createDeepSeekProvider } from "./providers/deepseek.js";
import { createOpenRouterProvider } from "./providers/openrouter.js";
import { OllamaProvider } from "./providers/ollama.js";
import { ModelRegistry } from "./registry.js";

export * from "./types.js";
export { ModelRegistry } from "./registry.js";

/**
 * Build a registry wired up to read secrets fresh on every call, so updates
 * made through Settings take effect without restarting the gateway.
 */
export function createModelRegistry(): ModelRegistry {
  const registry = new ModelRegistry();

  registry.register(new MockProvider());
  registry.register(new OpenAIProvider(() => loadSecrets().openai.apiKey));
  registry.register(
    new AnthropicProvider(() => loadSecrets().anthropic.apiKey),
  );
  registry.register(
    createDeepSeekProvider({
      getApiKey: () => loadSecrets().deepseek.apiKey,
      getBaseUrl: () => loadSecrets().deepseek.baseUrl,
    }),
  );
  registry.register(
    createOpenRouterProvider({
      getApiKey: () => loadSecrets().openrouter.apiKey,
      getBaseUrl: () => loadSecrets().openrouter.baseUrl,
    }),
  );
  registry.register(new OllamaProvider(() => loadSecrets().ollama.baseUrl));

  return registry;
}
