import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { id } = params;
    const { name, drone_id, area_id } = body;

    // Validate ID
    const droneId = parseInt(id, 10);
    if (!droneId || isNaN(droneId)) {
      return NextResponse.json(
        { status: false, message: "Invalid drone ID format." },
        { status: 400 }
      );
    }

    // Validate fields
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

    // Find the drone
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

    // Find the area (if provided)
    let areaRef;
    if (area_id) {
      const area = await prisma.area.findUnique({
        where: { area_id },
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

    // Update the drone
    const updatedDrone = await prisma.drone.update({
      where: { id: droneId },
      data: {
        name,
        drone_id,
        area_id,
        areaRef: areaRef || existingDrone.areaRef,
      },
    });

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
