import { exec } from "node:child_process";
import { z } from "zod";
import type { BaoPlugin, BaoTool, ToolInput } from "../types.js";

const TIMEOUT_MS = 20_000;
const MAX_OUTPUT = 50_000;

const BLOCKED_PATTERNS: RegExp[] = [
  /rm\s+-rf\s+\//,
  /\bsudo\b/,
  /\bmkfs\b/,
  /\bdd\b/,
  /\bshutdown\b/,
  /\breboot\b/,
  /chmod\s+-R\s+777\s+\//,
  /chown\s+-R\b/,
  /:\(\)\s*\{.*\};:/, // fork bomb
];

function isBlocked(command: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(command));
}

const runShell: BaoTool = {
  name: "run_shell",
  description:
    "Run a shell command in the project directory (disabled by default; local dev only).",
  inputSchema: z.object({ command: z.string() }),
  async execute(input: ToolInput, ctx) {
    const command =
      typeof input.command === "string" ? input.command.trim() : "";
    if (!command) {
      throw new Error('"command" must be a non-empty string.');
    }
    if (isBlocked(command)) {
      await ctx.emitEvent("shell.blocked", `Blocked dangerous command`, {
        command,
      });
      throw new Error("This command is blocked for safety and was not run.");
    }

    await ctx.emitEvent("shell.run", `$ ${command}`, { command });

    return new Promise((resolve) => {
      exec(
        command,
        { cwd: ctx.cwd, timeout: TIMEOUT_MS, maxBuffer: MAX_OUTPUT },
        (error, stdout, stderr) => {
          const exitCode =
            error && typeof error.code === "number" ? error.code : error ? 1 : 0;
          resolve({
            command,
            exitCode,
            stdout: stdout.slice(0, MAX_OUTPUT),
            stderr: stderr.slice(0, MAX_OUTPUT),
            timedOut: Boolean(error && error.killed),
          });
        },
      );
    });
  },
};

export const shellPlugin: BaoPlugin = {
  id: "bao.shell",
  name: "Shell",
  description:
    "Run shell commands locally. Disabled by default; enable with care.",
  tools: [runShell],
};
