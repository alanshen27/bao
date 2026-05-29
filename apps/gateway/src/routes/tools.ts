import type { FastifyInstance } from "fastify";
import { testToolSchema } from "@bao/shared";
import { projectCwd } from "../config/paths.js";
import { loadConfig } from "../config/config.js";
import { isToolEnabled } from "../plugins/index.js";
import type { ToolContext } from "../plugins/types.js";
import { pluginRegistry } from "../runtime.js";
import { badRequest, notFound, toErrorMessage } from "../utils/errors.js";

export async function toolRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { name: string } }>(
    "/api/tools/:name/test",
    async (request) => {
      const { name } = request.params;
      const body = testToolSchema.parse(request.body ?? {});
      const tool = pluginRegistry.getTool(name);
      if (!tool) throw notFound(`Tool "${name}" not found`);

      const config = loadConfig();
      if (!isToolEnabled(config, name)) {
        throw badRequest(`Tool "${name}" is disabled in settings.`);
      }

      const ctx: ToolContext = {
        cwd: projectCwd,
        sessionId: "tool-test",
        sessionCode: "tool-test",
        emitEvent: async () => {
          /* no-op for ad-hoc tests */
        },
      };

      try {
        const output = await tool.execute(body.input, ctx);
        return { ok: true, output };
      } catch (error) {
        return { ok: false, error: toErrorMessage(error) };
      }
    },
  );
}
