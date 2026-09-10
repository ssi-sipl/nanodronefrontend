import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { removeCameraPath } from "@/lib/mediamtx";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const droneId = id;
    if (!droneId || typeof droneId !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid drone ID format." },
        { status: 400 }
      );
    }

    const drone = await prisma.drone.delete({
      where: { id: droneId },
    });

    if (!drone) {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID does not exist.",
        },
        { status: 404 }
      );
    }

    if (drone.cameraFeed) {
      try {
        await removeCameraPath(drone.drone_id);
      } catch (mtxErr) {
        console.error("MediaMTX path removal failed:", mtxErr);
      }
    }

    return NextResponse.json(
      {
        status: true,
        message: "Drone deleted successfully",
        data: drone,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID does not exist.",
        },
        { status: 404 }
      );
    }

    console.error("Error at /api/drone/[id] (DELETE):", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}