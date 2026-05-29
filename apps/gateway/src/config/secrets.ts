import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { BaoSecrets } from "@bao/shared";
import { baoSecretsSchema } from "@bao/shared";
import { ensureBaoDir } from "./config.js";
import { secretsPath } from "./paths.js";
import { defaultSecrets } from "./schema.js";

// TODO: encrypt secrets at rest. Plain JSON is acceptable for the local MVP.

export function secretsExists(): boolean {
  return existsSync(secretsPath);
}

export function ensureDefaultSecrets(): BaoSecrets {
  ensureBaoDir();
  if (!secretsExists()) {
    saveSecrets(defaultSecrets);
    return defaultSecrets;
  }
  return loadSecrets();
}

export function loadSecrets(): BaoSecrets {
  if (!secretsExists()) {
    return ensureDefaultSecrets();
  }
  const raw = JSON.parse(readFileSync(secretsPath, "utf8")) as unknown;
  const merged = deepMergeSecrets(defaultSecrets, raw);
  return baoSecretsSchema.parse(merged);
}

export function saveSecrets(secrets: BaoSecrets): BaoSecrets {
  ensureBaoDir();
  const validated = baoSecretsSchema.parse(secrets);
  writeFileSync(
    secretsPath,
    `${JSON.stringify(validated, null, 2)}\n`,
    "utf8",
  );
  return validated;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMergeSecrets(base: BaoSecrets, patch: unknown): unknown {
  if (!isObject(patch)) return base;
  const result: Record<string, unknown> = {};
  for (const [providerId, baseValue] of Object.entries(base)) {
    const patchValue = patch[providerId];
    if (isObject(baseValue) && isObject(patchValue)) {
      result[providerId] = { ...baseValue, ...patchValue };
    } else {
      result[providerId] = baseValue;
    }
  }
  return result;
}
