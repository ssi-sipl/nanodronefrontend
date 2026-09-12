import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { registerCameraPath } from "@/lib/mediamtx";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { name, drone_id, area_id,usbaddress, cameraFeed } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "name" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    if (cameraFeed !== undefined && typeof cameraFeed !== "string") {
      return NextResponse.json(
        {
          status: false,
          message: 'Invalid input: "cameraFeed" must be a string.',
        },
        { status: 400 }
      );
    }

    if (!drone_id || typeof drone_id !== "string" || drone_id.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "drone_id" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    if (!area_id || typeof area_id !== "string" || area_id.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "area_id" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    const area = await prisma.area.findUnique({
      where: { area_id: area_id.toLocaleLowerCase().trim() },
    });
    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area with the provided ID does not exist." },
        { status: 404 }
      );
    }

    const droneExists = await prisma.drone.findFirst({
      where: {
        OR: [
          { drone_id: drone_id.toLocaleLowerCase().trim() },
          { name: name.toLocaleLowerCase().trim() },
        ],
      },
    });

    if (droneExists) {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID or name already exists.",
        },
        { status: 409 }
      );
    }

    const drone = await prisma.drone.create({
      data: {
        name: name.toLocaleLowerCase().trim(),
        drone_id: drone_id.toLocaleLowerCase().trim(),
        area_id: area_id.toLocaleLowerCase().trim(),
        areaRef: area.id,
        usbaddress: usbaddress?.trim() || null,
        cameraFeed: cameraFeed?.trim() || null,
      },
    });

    let streamWarning: string | undefined;
    if (drone.cameraFeed) {
      try {
        await registerCameraPath({ pathName: drone.drone_id, rtspUrl: drone.cameraFeed });
      } catch (mtxErr) {
        console.error("MediaMTX registration failed:", mtxErr);
        streamWarning =
          mtxErr instanceof Error ? mtxErr.message : "MediaMTX stream setup failed.";
      }
    }

    return NextResponse.json(
      {
        status: true,
        message: "Drone added successfully",
        data: drone,
        streamWarning,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error at controllers/droneController/createDrone: ", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}