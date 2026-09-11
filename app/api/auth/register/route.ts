import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const existingCount = await prisma.user.count();
    if (existingCount > 0) {
      return NextResponse.json(
        { status: false, message: "An admin account already exists. Registration is closed." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { status: false, message: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { status: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashed,
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Admin account created. You can now log in.",
        data: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error at /api/auth/register:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}