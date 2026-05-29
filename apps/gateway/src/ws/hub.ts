import type { WebSocket } from "ws";
import type { BaoWsEvent } from "./types.js";

/**
 * Tracks connected WebSocket clients and broadcasts Bao events to all of them.
 * Intentionally simple: every client receives every event and filters on the
 * client side. Good enough for a single-user local workspace.
 */
export class WsHub {
  private clients = new Set<WebSocket>();

  add(socket: WebSocket): void {
    this.clients.add(socket);
    socket.on("close", () => this.clients.delete(socket));
    socket.on("error", () => this.clients.delete(socket));
  }

  broadcast(event: BaoWsEvent): void {
    const payload = JSON.stringify(event);
    for (const client of this.clients) {
      // 1 === WebSocket.OPEN
      if (client.readyState === 1) {
        try {
          client.send(payload);
        } catch {
          this.clients.delete(client);
        }
      }
    }
  }

  get size(): number {
    return this.clients.size;
  }
}

export const wsHub = new WsHub();
