import type { FastifyInstance } from "fastify";
import type { SetupStatusDto } from "@bao/shared";
import { completeSetupSchema } from "@bao/shared";
import { configExists, loadConfig, saveConfig } from "../config/config.js";
import { loadSecrets, saveSecrets, secretsExists } from "../config/secrets.js";
import { modelRegistry } from "../runtime.js";
import { badRequest } from "../utils/errors.js";

export async function setupRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/setup/status", async (): Promise<SetupStatusDto> => {
    const config = loadConfig();
    return {
      onboardingCompleted: config.onboardingCompleted,
      configExists: configExists(),
      secretsExists: secretsExists(),
    };
  });

  app.post("/api/setup/complete", async (request) => {
    const body = completeSetupSchema.parse(request.body);
    if (!modelRegistry.has(body.defaultProvider)) {
      throw badRequest(`Unknown provider: ${body.defaultProvider}`);
    }

    const config = loadConfig();
    config.defaultProvider = body.defaultProvider;
    if (body.defaultModel) {
      config.defaultModel = body.defaultModel;
    }
    config.onboardingCompleted = true;
    saveConfig(config);

    if (body.secrets) {
      const secrets = loadSecrets();
      const s = body.secrets;
      if (s.openai?.apiKey !== undefined)
        secrets.openai.apiKey = s.openai.apiKey;
      if (s.anthropic?.apiKey !== undefined)
        secrets.anthropic.apiKey = s.anthropic.apiKey;
      if (s.deepseek?.apiKey !== undefined)
        secrets.deepseek.apiKey = s.deepseek.apiKey;
      if (s.deepseek?.baseUrl !== undefined)
        secrets.deepseek.baseUrl = s.deepseek.baseUrl;
      if (s.openrouter?.apiKey !== undefined)
        secrets.openrouter.apiKey = s.openrouter.apiKey;
      if (s.openrouter?.baseUrl !== undefined)
        secrets.openrouter.baseUrl = s.openrouter.baseUrl;
      if (s.ollama?.baseUrl !== undefined)
        secrets.ollama.baseUrl = s.ollama.baseUrl;
      saveSecrets(secrets);
    }

    return { ok: true, config };
  });
}
