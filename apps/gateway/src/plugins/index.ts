import type { BaoConfig } from "@bao/shared";
import { PluginRegistry } from "./registry.js";
import { filesystemPlugin } from "./builtin/filesystem.js";
import { shellPlugin } from "./builtin/shell.js";
import { memoryPlugin } from "./builtin/memory.js";

export * from "./types.js";
export { PluginRegistry } from "./registry.js";

const PLUGIN_TO_CONFIG_KEY: Record<string, keyof BaoConfig["tools"]> = {
  "bao.filesystem": "filesystem",
  "bao.shell": "shell",
  "bao.memory": "memory",
};

const TOOL_TO_PLUGIN: Record<string, string> = {
  list_dir: "bao.filesystem",
  read_file: "bao.filesystem",
  write_file: "bao.filesystem",
  file_exists: "bao.filesystem",
  search_files: "bao.filesystem",
  run_shell: "bao.shell",
  memory_save: "bao.memory",
  memory_list: "bao.memory",
  memory_search: "bao.memory",
};

export function createPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry();
  registry.register(filesystemPlugin);
  registry.register(shellPlugin);
  registry.register(memoryPlugin);
  return registry;
}

export function isPluginEnabled(config: BaoConfig, pluginId: string): boolean {
  const key = PLUGIN_TO_CONFIG_KEY[pluginId];
  if (!key) return true;
  return config.tools[key]?.enabled ?? false;
}

export function isToolEnabled(config: BaoConfig, toolName: string): boolean {
  const pluginId = TOOL_TO_PLUGIN[toolName];
  if (!pluginId) return true;
  return isPluginEnabled(config, pluginId);
}

/** Names of tools that are currently enabled given the config. */
export function enabledToolNames(
  registry: PluginRegistry,
  config: BaoConfig,
): string[] {
  return registry
    .listTools()
    .filter((tool) => isToolEnabled(config, tool.name))
    .map((tool) => tool.name);
}
