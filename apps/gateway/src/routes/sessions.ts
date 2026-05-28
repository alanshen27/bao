import type { FastifyInstance } from "fastify";
import {
  createSessionSchema,
  sendMessageSchema,
  spawnSchema,
} from "@bao/shared";
import {
  getSessionByCode,
  listEvents,
  listUsage,
  toEventDto,
  toUsageDto,
} from "../db/repositories.js";
import {
  createNewSession,
  getSessionDetail,
  getSessions,
  runSession,
  sendMessage,
  spawnHelper,
} from "../sessions/service.js";
import { notFound } from "../utils/errors.js";

export async function sessionRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/sessions", async () => getSessions());

  app.post("/api/sessions", async (request, reply) => {
    const body = createSessionSchema.parse(request.body);
    const session = await createNewSession({
      title: body.title,
      kind: body.kind,
      providerId: body.providerId,
      modelId: body.modelId,
    });
    reply.code(201);
    return session;
  });

  app.get<{ Params: { code: string } }>(
    "/api/sessions/:code",
    async (request) => getSessionDetail(request.params.code),
  );

  app.post<{ Params: { code: string } }>(
    "/api/sessions/:code/messages",
    async (request) => {
      const body = sendMessageSchema.parse(request.body);
      await sendMessage(request.params.code, body.content);
      return getSessionDetail(request.params.code);
    },
  );

  app.post<{ Params: { code: string } }>(
    "/api/sessions/:code/run",
    async (request) => {
      await runSession(request.params.code);
      return getSessionDetail(request.params.code);
    },
  );

  app.post<{ Params: { code: string } }>(
    "/api/sessions/:code/spawn",
    async (request) => {
      const body = spawnSchema.parse(request.body);
      const child = await spawnHelper(
        request.params.code,
        body.task,
        body.providerId,
        body.modelId,
      );
      return child;
    },
  );

  app.get<{ Params: { code: string } }>(
    "/api/sessions/:code/events",
    async (request) => {
      const session = await getSessionByCode(request.params.code);
      if (!session) throw notFound(`Session "${request.params.code}" not found`);
      const events = await listEvents(session.id);
      return events.map(toEventDto);
    },
  );

  app.get<{ Params: { code: string } }>(
    "/api/sessions/:code/usage",
    async (request) => {
      const session = await getSessionByCode(request.params.code);
      if (!session) throw notFound(`Session "${request.params.code}" not found`);
      const usage = await listUsage(session.id);
      return usage.map(toUsageDto);
    },
  );
}
