export type ToolInput = Record<string, unknown>;
export type ToolOutput = Record<string, unknown>;

export interface ToolContext {
  cwd: string;
  sessionId: string;
  sessionCode: string;
  emitEvent: (type: string, message: string, data?: unknown) => Promise<void>;
}

export interface BaoTool {
  name: string;
  description: string;
  inputSchema: unknown;
  execute(input: ToolInput, ctx: ToolContext): Promise<ToolOutput>;
}

export interface BaoPlugin {
  id: string;
  name: string;
  description?: string;
  tools: BaoTool[];
}
