import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import type { BaoConfig } from "@bao/shared";
import { baoConfigSchema } from "@bao/shared";
import { baoHome, configPath } from "./paths.js";
import { defaultConfig } from "./schema.js";

export function ensureBaoDir(): void {
  if (!existsSync(baoHome)) {
    mkdirSync(baoHome, { recursive: true });
  }
}

export function configExists(): boolean {
  return existsSync(configPath);
}

export function ensureDefaultConfig(): BaoConfig {
  ensureBaoDir();
  if (!configExists()) {
    saveConfig(defaultConfig);
    return defaultConfig;
  }
  return loadConfig();
}

export function loadConfig(): BaoConfig {
  if (!configExists()) {
    return ensureDefaultConfig();
  }
  const raw = JSON.parse(readFileSync(configPath, "utf8")) as unknown;
  // Merge with defaults so missing keys are filled in, then validate.
  const merged = mergeConfig(defaultConfig, raw);
  return baoConfigSchema.parse(merged);
}

export function saveConfig(config: BaoConfig): BaoConfig {
  ensureBaoDir();
  const validated = baoConfigSchema.parse(config);
  writeFileSync(configPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  return validated;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Shallow/deep merge of partial config onto defaults (objects only). */
function mergeConfig(base: BaoConfig, patch: unknown): unknown {
  if (!isObject(patch)) return base;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = (base as unknown as Record<string, unknown>)[key];
    if (isObject(current) && isObject(value)) {
      result[key] = { ...current, ...value };
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
