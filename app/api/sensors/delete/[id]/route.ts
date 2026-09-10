import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { removeCameraPath } from "@/lib/mediamtx";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const sensorId = id;
    if (!sensorId || typeof sensorId !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid ID format." },
        { status: 400 }
      );
    }

    const deletedSensor = await prisma.sensor
      .delete({ where: { id: sensorId } })
      .catch(() => null);

    if (!deletedSensor) {
      return NextResponse.json(
        { status: false, message: "Sensor not found." },
        { status: 404 }
      );
    }

    if (deletedSensor.cameraFeed) {
      try {
        await removeCameraPath(deletedSensor.sensor_id);
      } catch (mtxErr) {
        console.error("MediaMTX path removal failed:", mtxErr);
      }
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