import type { BaoWsEvent } from "./types";

type Listener = (event: BaoWsEvent) => void;

/**
 * Small WebSocket client with automatic reconnect. Components subscribe to
 * receive every Bao event and filter client-side.
 */
class BaoSocket {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldRun = false;

  connect(): void {
    this.shouldRun = true;
    this.open();
  }

  private open(): void {
    if (this.socket) return;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${window.location.host}/ws`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data as string) as BaoWsEvent;
        if (parsed && typeof (parsed as { type?: string }).type === "string") {
          for (const listener of this.listeners) listener(parsed);
        }
      } catch {
        /* ignore malformed frames */
      }
    };

    socket.onclose = () => {
      this.socket = null;
      if (this.shouldRun) this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, 1500);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const baoSocket = new BaoSocket();
