import { z } from "zod";

export const toolConfigSchema = z.object({
  enabled: z.boolean(),
});

export const baoConfigSchema = z.object({
  version: z.string(),
  gateway: z.object({
    host: z.string(),
    port: z.number().int().positive(),
  }),
  defaultProvider: z.string(),
  defaultModel: z.string(),
  budgetCapUsd: z.number().nonnegative(),
  onboardingCompleted: z.boolean(),
  tools: z.object({
    filesystem: toolConfigSchema,
    shell: toolConfigSchema,
    memory: toolConfigSchema,
  }),
});

export const baoSecretsSchema = z.object({
  openai: z.object({ apiKey: z.string() }),
  anthropic: z.object({ apiKey: z.string() }),
  deepseek: z.object({ apiKey: z.string(), baseUrl: z.string() }),
  openrouter: z.object({ apiKey: z.string(), baseUrl: z.string() }),
  ollama: z.object({ baseUrl: z.string() }),
});

export type BaoSecrets = z.infer<typeof baoSecretsSchema>;

export const sessionKindSchema = z.enum(["chat", "agent", "subagent"]);

export const createSessionSchema = z.object({
  title: z.string().optional(),
  kind: sessionKindSchema.default("chat"),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
});

export const spawnSchema = z.object({
  task: z.string().min(1, "A task description is required"),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
});

export const completeSetupSchema = z.object({
  defaultProvider: z.string(),
  defaultModel: z.string().optional(),
  secrets: z
    .object({
      openai: z.object({ apiKey: z.string() }).partial().optional(),
      anthropic: z.object({ apiKey: z.string() }).partial().optional(),
      deepseek: z
        .object({ apiKey: z.string(), baseUrl: z.string() })
        .partial()
        .optional(),
      openrouter: z
        .object({ apiKey: z.string(), baseUrl: z.string() })
        .partial()
        .optional(),
      ollama: z.object({ baseUrl: z.string() }).partial().optional(),
    })
    .optional(),
});

export const updateConfigSchema = baoConfigSchema.partial().extend({
  gateway: baoConfigSchema.shape.gateway.partial().optional(),
  tools: z
    .object({
      filesystem: toolConfigSchema.partial().optional(),
      shell: toolConfigSchema.partial().optional(),
      memory: toolConfigSchema.partial().optional(),
    })
    .optional(),
});

export const providerSecretsSchema = z.record(z.string(), z.string());

export const testToolSchema = z.object({
  input: z.record(z.string(), z.unknown()).default({}),
  sessionCode: z.string().optional(),
});
