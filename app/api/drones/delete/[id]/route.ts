import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    const droneId = parseInt(id, 10);
    if (!droneId || isNaN(droneId)) {
      return NextResponse.json(
        { status: false, message: "Invalid drone ID format." },
        { status: 400 }
      );
    }

    // Attempt to delete the drone
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

    return NextResponse.json(
      {
        status: true,
        message: "Drone deleted successfully",
        data: drone,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Prisma throws an error if the record doesn’t exist
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
