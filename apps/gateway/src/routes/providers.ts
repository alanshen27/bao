import type { FastifyInstance } from "fastify";
import type { ProviderDto } from "@bao/shared";
import { loadSecrets, saveSecrets } from "../config/secrets.js";
import { modelRegistry } from "../runtime.js";
import { badRequest } from "../utils/errors.js";

export async function providerRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/providers", async (): Promise<ProviderDto[]> => {
    const providers = modelRegistry.list();
    return Promise.all(
      providers.map(async (provider): Promise<ProviderDto> => {
        const [configured, models] = await Promise.all([
          provider.isConfigured(),
          provider.listModels().catch(() => [] as string[]),
        ]);
        return {
          id: provider.id,
          name: provider.name,
          kind: provider.kind,
          configured,
          models,
        };
      }),
    );
  });

  // Update secrets for a provider. Never echoes raw keys back.
  app.post<{ Params: { id: string }; Body: Record<string, string> }>(
    "/api/providers/:id/secrets",
    async (request) => {
      const { id } = request.params;
      const body = (request.body ?? {}) as Record<string, string>;
      const secrets = loadSecrets();

      switch (id) {
        case "openai":
          if (typeof body.apiKey === "string")
            secrets.openai.apiKey = body.apiKey;
          break;
        case "anthropic":
          if (typeof body.apiKey === "string")
            secrets.anthropic.apiKey = body.apiKey;
          break;
        case "deepseek":
          if (typeof body.apiKey === "string")
            secrets.deepseek.apiKey = body.apiKey;
          if (typeof body.baseUrl === "string")
            secrets.deepseek.baseUrl = body.baseUrl;
          break;
        case "openrouter":
          if (typeof body.apiKey === "string")
            secrets.openrouter.apiKey = body.apiKey;
          if (typeof body.baseUrl === "string")
            secrets.openrouter.baseUrl = body.baseUrl;
          break;
        case "ollama":
          if (typeof body.baseUrl === "string")
            secrets.ollama.baseUrl = body.baseUrl;
          break;
        default:
          throw badRequest(`Unknown provider: ${id}`);
      }

      saveSecrets(secrets);
      const provider = modelRegistry.get(id);
      return { ok: true, configured: await provider.isConfigured() };
    },
  );
}
