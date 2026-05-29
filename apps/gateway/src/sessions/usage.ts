import type { ChatResult } from "../models/types.js";

/**
 * Rough cost-per-1K-token table (USD) used only for approximate budget
 * tracking. Values are intentionally conservative estimates; providers that
 * return their own cost data are preferred when available.
 */
const COST_PER_1K: Record<string, { input: number; output: number }> = {
  "gpt-4.1": { input: 0.002, output: 0.008 },
  "gpt-4.1-mini": { input: 0.0004, output: 0.0016 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "claude-3-5-sonnet-latest": { input: 0.003, output: 0.015 },
  "claude-3-5-haiku-latest": { input: 0.0008, output: 0.004 },
  "deepseek-chat": { input: 0.00027, output: 0.0011 },
  "deepseek-reasoner": { input: 0.00055, output: 0.00219 },
};

const DEFAULT_RATE = { input: 0.0005, output: 0.0015 };

export function estimateCostUsd(
  modelId: string | undefined,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = (modelId && COST_PER_1K[modelId]) || DEFAULT_RATE;
  const cost = (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
  return Math.round(cost * 1e6) / 1e6;
}

/** Roughly approximate token count when a provider does not report usage. */
export function approximateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function normalizeUsage(
  result: ChatResult,
  modelId: string | undefined,
  promptText: string,
): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
} {
  const inputTokens =
    result.inputTokens ?? approximateTokens(promptText);
  const outputTokens =
    result.outputTokens ?? approximateTokens(result.content);
  const totalTokens = result.totalTokens ?? inputTokens + outputTokens;
  const estimatedCostUsd =
    result.estimatedCostUsd ?? estimateCostUsd(modelId, inputTokens, outputTokens);
  return { inputTokens, outputTokens, totalTokens, estimatedCostUsd };
}
