import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Confirmation token is required" }, { status: 400 });
  }

  const verification = await prisma.verification.findFirst({
    where: {
      identifier: { startsWith: "newsletter:" },
      value: token,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    return NextResponse.json(
      { error: "Invalid or expired confirmation link" },
      { status: 400 }
    );
  }

  const email = verification.identifier.slice("newsletter:".length);
  await prisma.$transaction([
    prisma.newsletterSubscription.updateMany({
      where: { email, status: "PENDING" },
      data: { status: "ACTIVE" },
    }),
    prisma.verification.delete({ where: { id: verification.id } }),
  ]);

  return NextResponse.json(
    { success: true, message: "Newsletter subscription confirmed" },
    { status: 200 }
  );
}