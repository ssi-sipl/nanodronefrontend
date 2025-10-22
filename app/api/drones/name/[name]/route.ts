import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = await params;

    console.log("Fetching drone ID for name:", name);

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { status: false, message: "Invalid or missing drone name." },
        { status: 400 }
      );
    }

    // Find drone by name
    const drone = await prisma.drone.findFirst({
      where: { name },
    });

    if (!drone) {
      return NextResponse.json(
        { status: false, message: "Drone not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Drone ID fetched successfully.",
        data: drone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/drone/by-name/[name]:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
