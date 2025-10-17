import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sensors = await prisma.sensor.findMany();

    if (!sensors || sensors.length === 0) {
      return NextResponse.json(
        { status: true, message: "No sensors found", data: [] },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Sensors fetched successfully",
        data: sensors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/sensor (GET):", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
