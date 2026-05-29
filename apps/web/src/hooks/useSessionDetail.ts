import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { baoSocket } from "../lib/ws";
import type { SessionDetailDto } from "../lib/types";

export function useSessionDetail(code: string | undefined) {
  const [detail, setDetail] = useState<SessionDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  const reload = useCallback(async () => {
    if (!code) return;
    try {
      const next = await api.getSession(code);
      if (codeRef.current === code) {
        setDetail(next);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!code) return;
    const unsubscribe = baoSocket.subscribe((event) => {
      if (!("sessionCode" in event)) {
        // session.created / session.updated — refresh if it touches this tree.
        if (event.type === "session.updated" && event.session.code === code) {
          setDetail((prev) =>
            prev ? { ...prev, session: event.session } : prev,
          );
        }
        void reload();
        return;
      }
      if (event.sessionCode !== code) return;

      setDetail((prev) => {
        if (!prev) return prev;
        switch (event.type) {
          case "message.created":
            if (prev.messages.some((m) => m.id === event.message.id)) return prev;
            return { ...prev, messages: [...prev.messages, event.message] };
          case "event.created":
            if (prev.events.some((e) => e.id === event.event.id)) return prev;
            return { ...prev, events: [...prev.events, event.event] };
          case "usage.created":
            return {
              ...prev,
              usage: {
                inputTokens: prev.usage.inputTokens + event.usage.inputTokens,
                outputTokens:
                  prev.usage.outputTokens + event.usage.outputTokens,
                totalTokens: prev.usage.totalTokens + event.usage.totalTokens,
                estimatedCostUsd:
                  prev.usage.estimatedCostUsd + event.usage.estimatedCostUsd,
              },
            };
          case "toolcall.created":
            if (prev.toolCalls.some((t) => t.id === event.toolCall.id))
              return prev;
            return { ...prev, toolCalls: [...prev.toolCalls, event.toolCall] };
          case "toolcall.updated":
            return {
              ...prev,
              toolCalls: prev.toolCalls.map((t) =>
                t.id === event.toolCall.id ? event.toolCall : t,
              ),
            };
          default:
            return prev;
        }
      });
    });
    return unsubscribe;
  }, [code, reload]);

  return { detail, loading, error, reload, setDetail };
}
