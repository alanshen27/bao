export interface ParsedToolCall {
  tool: string;
  input: Record<string, unknown>;
}

/**
 * Attempt to extract a single tool-call JSON object from a model response.
 * The model is asked to emit {"tool":"name","input":{...}}. We tolerate the
 * object being wrapped in prose or fenced code blocks.
 */
export function extractToolCall(text: string): ParsedToolCall | null {
  const candidates = collectJsonCandidates(text);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "tool" in parsed &&
        typeof (parsed as { tool: unknown }).tool === "string"
      ) {
        const obj = parsed as { tool: string; input?: unknown };
        const input =
          typeof obj.input === "object" && obj.input !== null
            ? (obj.input as Record<string, unknown>)
            : {};
        return { tool: obj.tool, input };
      }
    } catch {
      // not valid JSON; try next candidate
    }
  }
  return null;
}

function collectJsonCandidates(text: string): string[] {
  const candidates: string[] = [];

  // Fenced code blocks ```json ... ```
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(text)) !== null) {
    candidates.push(match[1].trim());
  }

  // First balanced { ... } region.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    candidates.push(text.slice(start, end + 1));
  }

  candidates.push(text.trim());
  return candidates;
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
