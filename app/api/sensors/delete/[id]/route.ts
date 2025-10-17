import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    const sensorId = parseInt(id, 10);
    if (!sensorId || isNaN(sensorId)) {
      return NextResponse.json(
        { status: false, message: "Invalid ID format." },
        { status: 400 }
      );
    }

    // Attempt to delete the sensor
    const deletedSensor = await prisma.sensor
      .delete({ where: { id: sensorId } })
      .catch(() => null); // Handle non-existent sensor

    if (!deletedSensor) {
      return NextResponse.json(
        { status: false, message: "Sensor not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Sensor deleted successfully",
        sensor: deletedSensor,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at /api/sensor/[id] (DELETE):", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
