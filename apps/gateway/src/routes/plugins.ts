import type { FastifyInstance } from "fastify";
import type { PluginDto, ToolDto } from "@bao/shared";
import { loadConfig } from "../config/config.js";
import { isPluginEnabled, isToolEnabled } from "../plugins/index.js";
import { pluginRegistry } from "../runtime.js";

export async function pluginRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/plugins", async () => {
    const config = loadConfig();
    return pluginRegistry.listPlugins().map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      enabled: isPluginEnabled(config, plugin.id),
      tools: plugin.tools.map(
        (tool): ToolDto => ({
          name: tool.name,
          description: tool.description,
          pluginId: plugin.id,
          pluginName: plugin.name,
        }),
      ),
    })) satisfies (PluginDto & { enabled: boolean })[];
  });

  app.get("/api/tools", async () => {
    const config = loadConfig();
    return pluginRegistry.listTools().map((tool) => {
      const plugin = pluginRegistry.pluginForTool(tool.name);
      return {
        name: tool.name,
        description: tool.description,
        pluginId: plugin?.id ?? "",
        pluginName: plugin?.name ?? "",
        enabled: isToolEnabled(config, tool.name),
      };
    });
  });
}
