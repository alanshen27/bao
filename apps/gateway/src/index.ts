import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { ZodError } from "zod";
import type { WebSocket } from "ws";
import { ensureDefaultConfig, loadConfig } from "./config/config.js";
import { ensureDefaultSecrets } from "./config/secrets.js";
import { baoHome } from "./config/paths.js";
import { prisma, disconnectPrisma } from "./db/prisma.js";
import { wsHub } from "./ws/hub.js";
import { HttpError } from "./utils/errors.js";
import { setupRoutes } from "./routes/setup.js";
import { configRoutes } from "./routes/config.js";
import { providerRoutes } from "./routes/providers.js";
import { sessionRoutes } from "./routes/sessions.js";
import { pluginRoutes } from "./routes/plugins.js";
import { toolRoutes } from "./routes/tools.js";

async function main(): Promise<void> {
  // Local-first bootstrap: make sure config + secrets exist on disk.
  ensureDefaultConfig();
  ensureDefaultSecrets();
  const config = loadConfig();

  // Verify the database is reachable (run `npm run db:setup` if this fails).
  await prisma.$queryRaw`SELECT 1`;

  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({
        error: "ValidationError",
        message: error.issues.map((i) => i.message).join("; "),
        issues: error.issues,
      });
      return;
    }
    if (error instanceof HttpError) {
      reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
      return;
    }
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    reply.code(500).send({
      error: "InternalServerError",
      message: message || "Something went wrong.",
    });
  });

  app.get("/api/health", async () => ({
    ok: true,
    name: "bao-gateway",
    home: baoHome,
  }));

  await app.register(async (instance) => {
    instance.get("/ws", { websocket: true }, (socket: WebSocket) => {
      wsHub.add(socket);
      socket.send(JSON.stringify({ type: "hello", message: "Bao is served locally." }));
    });
  });

  await app.register(setupRoutes);
  await app.register(configRoutes);
  await app.register(providerRoutes);
  await app.register(sessionRoutes);
  await app.register(pluginRoutes);
  await app.register(toolRoutes);

  const { host, port } = config.gateway;
  await app.listen({ host, port });
  // eslint-disable-next-line no-console
  console.log(`🥟 Bao gateway served locally at http://${host}:${port}`);
  // eslint-disable-next-line no-console
  console.log(`   Local data lives in ${baoHome}`);

  const shutdown = async (): Promise<void> => {
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start Bao gateway:", error);
  process.exit(1);
});
