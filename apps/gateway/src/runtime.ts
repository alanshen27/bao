import { createModelRegistry } from "./models/index.js";
import { createPluginRegistry } from "./plugins/index.js";

export const modelRegistry = createModelRegistry();
export const pluginRegistry = createPluginRegistry();
export { wsHub } from "./ws/hub.js";
