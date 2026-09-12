import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerCameraPath } from "@/lib/mediamtx";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { name, drone_id, area_id, usbaddress, cameraFeed } = body;

    if (cameraFeed !== undefined && typeof cameraFeed !== "string") {
      return NextResponse.json(
        { status: false, message: 'Invalid input: "cameraFeed" must be a string.' },
        { status: 400 }
      );
    }

    if(usbaddress !== undefined && typeof usbaddress !== "string"){
      return NextResponse.json(
       { status:false, message: 'Invalid input: "usbaddress" must be a string.', },
       {status: 400}
      );    
    }

    const droneId = id;
    if (!droneId || typeof droneId !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid drone ID format." },
        { status: 400 }
      );
    }

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

    const existingDrone = await prisma.drone.findUnique({
      where: { id: droneId },
    });

    if (!existingDrone) {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID does not exist.",
        },
        { status: 404 }
      );
    }

    let areaRef;
    if (area_id) {
      const normalizedAreaId = area_id.toLocaleLowerCase().trim();
      const area = await prisma.area.findUnique({
        where: { area_id: normalizedAreaId },
      });

      if (!area) {
        return NextResponse.json(
          {
            status: false,
            message: "Area with the provided ID does not exist.",
          },
          { status: 404 }
        );
      }
      areaRef = area.id;
    }

    const updatedDrone = await prisma.drone.update({
      where: { id: droneId },
      data: {
        name,
        drone_id,
        area_id: area_id ? area_id.toLocaleLowerCase().trim() : area_id,
        areaRef: areaRef || existingDrone.areaRef,
        ...(usbaddress !== undefined ? { usbaddress: usbaddress.trim() || null }: {}),
        ...(cameraFeed !== undefined ? { cameraFeed: cameraFeed.trim() || null } : {}),
      },
    });

    if (body.cameraFeed) {
      try {
        await registerCameraPath({ pathName: updatedDrone.drone_id, rtspUrl: body.cameraFeed });
      } catch (mtxErr) {
        console.error("MediaMTX update failed:", mtxErr);
      }
    }

    return NextResponse.json(
      {
        status: true,
        message: "Drone updated successfully",
        data: updatedDrone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/drone/[id]:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}