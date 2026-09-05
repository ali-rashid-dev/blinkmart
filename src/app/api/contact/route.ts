import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website?: string;
  turnstileToken?: string;
}

const contactRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const recentRequests = (contactRequests.get(clientKey) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    contactRequests.set(clientKey, recentRequests);
    return true;
  }

  recentRequests.push(now);
  contactRequests.set(clientKey, recentRequests);
  return false;
}

async function passesBotVerification(request: NextRequest, body: ContactRequest) {
  if (body.website) {
    return false;
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    return true;
  }

  if (!body.turnstileToken) {
    return false;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: turnstileSecret,
      response: body.turnstileToken,
      remoteip: getClientKey(request),
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result: unknown = await response.json();
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === true
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    // Validate that at least email or phone is provided
    if (!body.email && !body.phone) {
      return NextResponse.json(
        { error: "At least one contact method (email or phone) is required" },
        { status: 400 }
      );
    }

    if (isRateLimited(getClientKey(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!(await passesBotVerification(request, body))) {
      return NextResponse.json(
        { error: "Request verification failed" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY as string);
    const requestId = crypto.randomUUID();
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.SUPPORT_EMAIL || "support@kitandco.pk",
      replyTo: body.email || undefined,
      subject: `[Contact ${requestId}] ${body.subject}`,
      text: [
        `Name: ${body.name}`,
        `Email: ${body.email || "N/A"}`,
        `Phone: ${body.phone || "N/A"}`,
        `Message: ${body.message}`,
      ].join("\n"),
    });

    if (error) {
      throw error;
    }

    console.log("Contact form submission:", {
      requestId,
      deliveryStatus: "sent",
    });

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
