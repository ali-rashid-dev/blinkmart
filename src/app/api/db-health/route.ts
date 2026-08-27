import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    let status = "ok";
    let error: string | null = null;

    try {
      await prisma.$queryRaw`SELECT 1 as ping`;
    } catch (e) {
      status = "error";
      error = e instanceof Error ? e.message : String(e);
    }

    results.push({
      attempt: i + 1,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      status,
      error,
    });

    // Wait 500ms between attempts so we can observe per-query reconnection latency
    if (i < 4) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return NextResponse.json({ results });
}
