import {
  readFile,
  readdir,
  stat,
  writeFile,
  mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, relative } from "node:path";
import { z } from "zod";
import { resolveWithinRoot } from "../../utils/paths.js";
import type { BaoPlugin, BaoTool, ToolInput } from "../types.js";

const MAX_READ_BYTES = 200_000;

function asString(input: ToolInput, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`"${key}" must be a non-empty string.`);
  }
  return value;
}

const listDir: BaoTool = {
  name: "list_dir",
  description: "List files and folders in a directory inside the project.",
  inputSchema: z.object({ path: z.string().default(".") }),
  async execute(input, ctx) {
    const path = typeof input.path === "string" && input.path ? input.path : ".";
    const target = resolveWithinRoot(ctx.cwd, path);
    const entries = await readdir(target, { withFileTypes: true });
    await ctx.emitEvent("fs.list_dir", `Listed ${path}`, { path });
    return {
      path,
      entries: entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "dir" : "file",
      })),
    };
  },
};

const readFileTool: BaoTool = {
  name: "read_file",
  description: "Read a UTF-8 text file inside the project (size-limited).",
  inputSchema: z.object({ path: z.string() }),
  async execute(input, ctx) {
    const path = asString(input, "path");
    const target = resolveWithinRoot(ctx.cwd, path);
    const info = await stat(target);
    if (info.size > MAX_READ_BYTES) {
      throw new Error(
        `File "${path}" is too large to read (${info.size} bytes, limit ${MAX_READ_BYTES}).`,
      );
    }
    const content = await readFile(target, "utf8");
    await ctx.emitEvent("fs.read_file", `Read ${path}`, { path, bytes: info.size });
    return { path, content, bytes: info.size };
  },
};

const writeFileTool: BaoTool = {
  name: "write_file",
  description: "Write a UTF-8 text file inside the project.",
  inputSchema: z.object({ path: z.string(), content: z.string() }),
  async execute(input, ctx) {
    const path = asString(input, "path");
    const content = typeof input.content === "string" ? input.content : "";
    const target = resolveWithinRoot(ctx.cwd, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
    await ctx.emitEvent("fs.write_file", `Wrote ${path}`, {
      path,
      bytes: Buffer.byteLength(content, "utf8"),
    });
    return { path, bytesWritten: Buffer.byteLength(content, "utf8") };
  },
};

const fileExists: BaoTool = {
  name: "file_exists",
  description: "Check whether a file or folder exists inside the project.",
  inputSchema: z.object({ path: z.string() }),
  async execute(input, ctx) {
    const path = asString(input, "path");
    const target = resolveWithinRoot(ctx.cwd, path);
    return { path, exists: existsSync(target) };
  },
};

const searchFiles: BaoTool = {
  name: "search_files",
  description:
    "Search for a substring across text files in the project (shallow, capped).",
  inputSchema: z.object({
    query: z.string(),
    dir: z.string().default("."),
    maxResults: z.number().int().positive().default(50),
  }),
  async execute(input, ctx) {
    const query = asString(input, "query");
    const dir = typeof input.dir === "string" && input.dir ? input.dir : ".";
    const maxResults =
      typeof input.maxResults === "number" ? input.maxResults : 50;
    const root = resolveWithinRoot(ctx.cwd, dir);
    const matches: { path: string; line: number; text: string }[] = [];

    async function walk(current: string, depth: number): Promise<void> {
      if (depth > 4 || matches.length >= maxResults) return;
      const entries = await readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        if (matches.length >= maxResults) break;
        if (entry.name === "node_modules" || entry.name.startsWith(".")) {
          continue;
        }
        const full = `${current}/${entry.name}`;
        if (entry.isDirectory()) {
          await walk(full, depth + 1);
        } else {
          try {
            const info = await stat(full);
            if (info.size > MAX_READ_BYTES) continue;
            const content = await readFile(full, "utf8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i += 1) {
              if (lines[i].includes(query)) {
                matches.push({
                  path: relative(ctx.cwd, full),
                  line: i + 1,
                  text: lines[i].slice(0, 200),
                });
                if (matches.length >= maxResults) break;
              }
            }
          } catch {
            // skip unreadable/binary files
          }
        }
      }
    }

    await walk(root, 0);
    await ctx.emitEvent("fs.search_files", `Searched for "${query}"`, {
      query,
      results: matches.length,
    });
    return { query, matches };
  },
};

export const filesystemPlugin: BaoPlugin = {
  id: "bao.filesystem",
  name: "Filesystem",
  description: "Read, write, and search files safely inside the project.",
  tools: [listDir, readFileTool, writeFileTool, fileExists, searchFiles],
};
