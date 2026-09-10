import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerCameraPath } from "@/lib/mediamtx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Request body is required." },
        { status: 400 }
      );
    }

    const { name, area_id, sensor_id, latitude, longitude, cameraFeed } = body;

    if (
      !name ||
      !area_id ||
      !sensor_id ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { status: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { status: false, message: "Latitude and longitude must be numbers." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof area_id !== "string" ||
      typeof sensor_id !== "string"
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "Name, area_id, and sensor_id must be strings.",
        },
        { status: 400 }
      );
    }

    if (cameraFeed !== undefined && typeof cameraFeed !== "string") {
      return NextResponse.json(
        { status: false, message: 'Invalid input: "cameraFeed" must be a string.' },
        { status: 400 }
      );
    }

    const existingSensor = await prisma.sensor.findFirst({
      where: {
        OR: [{ sensor_id }, { name }],
      },
    });

    if (existingSensor) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Sensor with the same sensor_id or sensor_name already exists.",
        },
        { status: 409 }
      );
    }

    const existingArea = await prisma.area.findUnique({
      where: { area_id },
    });

    if (!existingArea) {
      return NextResponse.json(
        {
          status: false,
          message: "Area with the provided area_id does not exist.",
        },
        { status: 404 }
      );
    }

    const newSensor = await prisma.sensor.create({
      data: {
        name,
        area_id,
        sensor_id,
        latitude: Number(latitude.toPrecision(8)),
        longitude: Number(longitude.toPrecision(8)),
        cameraFeed: cameraFeed?.trim() || null,
      },
    });

    if (newSensor.cameraFeed) {
      try {
        await registerCameraPath({ pathName: newSensor.sensor_id, rtspUrl: newSensor.cameraFeed });
      } catch (mtxErr) {
        console.error("MediaMTX registration failed:", mtxErr);
      }
    }

    return NextResponse.json(
      {
        status: true,
        message: "Sensor created successfully",
        sensor: newSensor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error at /api/sensor:", error);
    return NextResponse.json(
      { status: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}