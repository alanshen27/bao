import type { FastifyInstance } from "fastify";
import { updateConfigSchema } from "@bao/shared";
import { loadConfig, saveConfig } from "../config/config.js";

export async function configRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/config", async () => {
    return loadConfig();
  });

  app.post("/api/config", async (request) => {
    const patch = updateConfigSchema.parse(request.body);
    const config = loadConfig();

    if (patch.defaultProvider !== undefined)
      config.defaultProvider = patch.defaultProvider;
    if (patch.defaultModel !== undefined)
      config.defaultModel = patch.defaultModel;
    if (patch.budgetCapUsd !== undefined)
      config.budgetCapUsd = patch.budgetCapUsd;
    if (patch.onboardingCompleted !== undefined)
      config.onboardingCompleted = patch.onboardingCompleted;
    if (patch.gateway) {
      config.gateway = { ...config.gateway, ...patch.gateway };
    }
    if (patch.tools) {
      if (patch.tools.filesystem)
        config.tools.filesystem = {
          ...config.tools.filesystem,
          ...patch.tools.filesystem,
        };
      if (patch.tools.shell)
        config.tools.shell = { ...config.tools.shell, ...patch.tools.shell };
      if (patch.tools.memory)
        config.tools.memory = {
          ...config.tools.memory,
          ...patch.tools.memory,
        };
    }

    return saveConfig(config);
  });
}
