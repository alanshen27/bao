import { databaseUrl } from "../config/paths.js";

// Point Prisma at the local-first SQLite database before the client loads.
process.env.DATABASE_URL = databaseUrl;

const { PrismaClient } = await import("@prisma/client");

export const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
