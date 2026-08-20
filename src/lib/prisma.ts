import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // 1. Import pg's Pool helper

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 2. Instantiate a Pool with explicit timeout settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000, // Wait up to 30 seconds for Neon to wake up
  idleTimeoutMillis: 10000,       // Close idle connections after 10 seconds
  max: 10,                         // Clamp max connections to prevent pool saturation
});

// 3. Pass the configured pool into the PrismaPg adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
