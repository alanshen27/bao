import type { BaoPlugin, BaoTool } from "./types.js";

export class PluginRegistry {
  private plugins = new Map<string, BaoPlugin>();
  private tools = new Map<string, BaoTool>();

  register(plugin: BaoPlugin): void {
    this.plugins.set(plugin.id, plugin);
    for (const tool of plugin.tools) {
      if (this.tools.has(tool.name)) {
        throw new Error(`Duplicate tool name: ${tool.name}`);
      }
      this.tools.set(tool.name, tool);
    }
  }

  listPlugins(): BaoPlugin[] {
    return [...this.plugins.values()];
  }

  listTools(): BaoTool[] {
    return [...this.tools.values()];
  }

  getTool(name: string): BaoTool | undefined {
    return this.tools.get(name);
  }

  pluginForTool(name: string): BaoPlugin | undefined {
    for (const plugin of this.plugins.values()) {
      if (plugin.tools.some((tool) => tool.name === name)) {
        return plugin;
      }
    }
    return undefined;
  }
}
