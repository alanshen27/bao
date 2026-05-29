import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import type { BaoPlugin, BaoTool, ToolInput } from "../types.js";

function asString(input: ToolInput, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`"${key}" must be a non-empty string.`);
  }
  return value;
}

function asTags(input: ToolInput): string[] {
  const value = input.tags;
  if (Array.isArray(value)) {
    return value.filter((t): t is string => typeof t === "string");
  }
  return [];
}

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === "string");
    }
  } catch {
    // fall through
  }
  return [];
}

const memorySave: BaoTool = {
  name: "memory_save",
  description: "Save a short note to Bao's local memory.",
  inputSchema: z.object({
    content: z.string(),
    tags: z.array(z.string()).optional(),
  }),
  async execute(input, ctx) {
    const content = asString(input, "content");
    const tags = asTags(input);
    const memory = await prisma.memory.create({
      data: { content, tagsJson: tags.length > 0 ? JSON.stringify(tags) : null },
    });
    await ctx.emitEvent("memory.save", "Saved a memory", { id: memory.id });
    return { id: memory.id, content: memory.content, tags };
  },
};

const memoryList: BaoTool = {
  name: "memory_list",
  description: "List the most recent saved memories.",
  inputSchema: z.object({ limit: z.number().int().positive().default(20) }),
  async execute(input) {
    const limit = typeof input.limit === "number" ? input.limit : 20;
    const memories = await prisma.memory.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return {
      memories: memories.map((m) => ({
        id: m.id,
        content: m.content,
        tags: parseTags(m.tagsJson),
        createdAt: m.createdAt.toISOString(),
      })),
    };
  },
};

const memorySearch: BaoTool = {
  name: "memory_search",
  description: "Search saved memories by substring.",
  inputSchema: z.object({ query: z.string() }),
  async execute(input) {
    const query = asString(input, "query");
    const memories = await prisma.memory.findMany({
      where: { content: { contains: query } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      query,
      memories: memories.map((m) => ({
        id: m.id,
        content: m.content,
        tags: parseTags(m.tagsJson),
        createdAt: m.createdAt.toISOString(),
      })),
    };
  },
};

export const memoryPlugin: BaoPlugin = {
  id: "bao.memory",
  name: "Memory",
  description: "Save, list, and search small notes in local memory.",
  tools: [memorySave, memoryList, memorySearch],
};
