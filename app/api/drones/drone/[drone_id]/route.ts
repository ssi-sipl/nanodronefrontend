import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { drone_id: string } }
) {
  try {
    const { drone_id } = params;

    if (!drone_id || typeof drone_id !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid or missing drone ID." },
        { status: 400 }
      );
    }

    // Find drone including its associated area
    const drone = await prisma.drone.findUnique({
      where: { drone_id },
      include: { area: true },
    });

    if (!drone) {
      return NextResponse.json(
        { status: false, message: "Drone not found." },
        { status: 404 }
      );
    }

    const area = drone.area;
    if (!area) {
      return NextResponse.json(
        {
          status: false,
          message: "Associated area not found for this drone.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Area fetched successfully.",
        data: area,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/area/[drone_id]:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
