import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

    const body: SubscribeRequest = { email: payload.email.trim().toLowerCase() };

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: body.email },
    });

    if (existingSubscription?.status === "ACTIVE") {
      return NextResponse.json(
        { success: true, message: "This email is already subscribed" },
        { status: 200 }
      );
    }

    await prisma.newsletterSubscription.upsert({
      where: { email: body.email },
      update: { status: "PENDING" },
      create: { email: body.email, status: "PENDING" },
    });

    const token = crypto.randomUUID();
    await prisma.verification.deleteMany({
      where: { identifier: `newsletter:${body.email}` },
    });
    await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: `newsletter:${body.email}`,
        value: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const confirmationUrl = new URL(
      "/api/newsletter/confirm",
      process.env.BETTER_AUTH_URL || request.nextUrl.origin
    );
    confirmationUrl.searchParams.set("token", token);

    const resend = new Resend(process.env.RESEND_API_KEY as string);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: body.email,
      subject: "Confirm your BlinkMart newsletter subscription",
      text: `Confirm your subscription by visiting: ${confirmationUrl.toString()}`,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, message: "Please check your email to confirm subscription" },
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
