import { NextRequest, NextResponse } from "next/server";

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
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

    // TODO: Persist contact submission to database or send email notification
    // For now, just log it
    console.log("Contact form submission:", {
      timestamp: new Date().toISOString(),
      name: body.name,
      email: body.email || "N/A",
      phone: body.phone || "N/A",
      subject: body.subject,
      message: body.message,
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
