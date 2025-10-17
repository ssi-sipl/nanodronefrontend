import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { status: false, message: "Sensor name is required." },
        { status: 400 }
      );
    }

    const sensor = await prisma.sensor.findFirst({
      where: { name },
    });

    if (!sensor) {
      return NextResponse.json(
        { status: false, message: "Sensor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Sensor fetched successfully",
        data: sensor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/sensor/by-name/[name] (GET):", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
