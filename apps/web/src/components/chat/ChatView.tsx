import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { BaoLogo } from "../bao/BaoLogo";
import type { MessageDto } from "../../lib/types";

interface ChatViewProps {
  messages: MessageDto[];
  busy: boolean;
  onSend: (content: string) => Promise<void>;
  onRun: () => Promise<void>;
  onSpawn: (task: string) => Promise<void>;
}

export function ChatView({
  messages,
  busy,
  onSend,
  onRun,
  onSpawn,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="bao-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-bao-muted">
            <BaoLogo size={64} />
            <p className="mt-3 font-display text-base text-bao-soy">
              Fresh out of the steamer
            </p>
            <p className="mt-1 text-sm">
              Say hello, or hit Run to let Bao cook up a plan.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {busy && (
          <div className="flex items-center gap-2 px-1 text-sm text-bao-muted">
            <span className="h-2 w-2 animate-soft-pulse rounded-full bg-bao-chili" />
            Bao is steaming a reply…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <Composer onSend={onSend} onRun={onRun} onSpawn={onSpawn} busy={busy} />
    </div>
  );
}
