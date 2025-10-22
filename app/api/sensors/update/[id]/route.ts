import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Request body is required." },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { name, area_id, sensor_id, latitude, longitude } = body;

    // Validate ID
    const sensorId = id;
    if (!sensorId || typeof sensorId !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid ID format." },
        { status: 400 }
      );
    }

    // Validate input
    if (!sensor_id) {
      return NextResponse.json(
        { status: false, message: "Sensor ID is required." },
        { status: 400 }
      );
    }

    if (
      !name &&
      !area_id &&
      latitude === undefined &&
      longitude === undefined
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "All fields are required to update the sensor.",
        },
        { status: 400 }
      );
    }

    // Check if the sensor exists
    const existingSensor = await prisma.sensor.findUnique({
      where: { id: sensorId },
    });

    if (!existingSensor) {
      return NextResponse.json(
        { status: false, message: "Sensor not found." },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (area_id) updateData.area_id = area_id;
    if (sensor_id) updateData.sensor_id = sensor_id;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    // Update the sensor
    const updatedSensor = await prisma.sensor.update({
      where: { id: sensorId },
      data: updateData,
    });

    return NextResponse.json(
      {
        status: true,
        message: "Sensor updated successfully",
        sensor: updatedSensor,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error at /api/sensor/[id] (PUT):", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
