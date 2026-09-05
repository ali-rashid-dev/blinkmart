import { NextRequest, NextResponse } from "next/server";

interface SubscribeRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // TODO: Persist newsletter subscription to database
    // For now, just log it
    console.log("Newsletter subscription:", {
      timestamp: new Date().toISOString(),
      email: body.email,
    });

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
