import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  pool?: Pool;
};

let pool: Pool;
if (globalForPrisma.pool) {
  pool = globalForPrisma.pool;
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
    max: 10,
  });

  // Attach a single error listener to avoid duplicate handlers across hot reloads
  pool.on("error", (err) => {
    // Log unexpected idle client errors. Keep behavior simple and non-throwing.
    // This listener is intentionally attached once on the cached pool.
    // eslint-disable-next-line no-console
    console.error("Unexpected idle client error on Postgres pool:", err);
  });

  globalForPrisma.pool = pool;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
