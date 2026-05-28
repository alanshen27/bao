import { cn } from "../../lib/cn";
import { formatTime } from "../../lib/format";
import type { MessageDto } from "../../lib/types";

export function MessageBubble({ message }: { message: MessageDto }) {
  const isUser = message.role === "user";
  const isTool = message.role === "tool";

  if (isTool) {
    return (
      <div className="animate-fade-in flex justify-start">
        <div className="max-w-[85%] rounded-2xl border border-bao-border bg-bao-card-soft px-3 py-2">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-bao-muted">
            tool result
          </div>
          <pre className="bao-scroll max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-bao-soy">
            {message.content}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-fade-in flex",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-bao",
          isUser
            ? "text-white [background:linear-gradient(135deg,#e56a3a,#f09a52)]"
            : "border border-bao-border bg-bao-card text-bao-text",
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={cn(
            "mt-1 text-[11px]",
            isUser ? "text-white/70" : "text-bao-muted",
          )}
        >
          {message.role} · {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
