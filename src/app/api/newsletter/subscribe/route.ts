import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SubscribeRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: unknown = await request.json();

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("email" in payload) ||
      typeof payload.email !== "string" ||
      !payload.email
    ) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const body: SubscribeRequest = { email: payload.email };

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.upsert({
      where: { email: body.email },
      update: {},
      create: { email: body.email },
    });

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
