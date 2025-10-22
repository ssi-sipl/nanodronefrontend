import prisma from "@/lib/prisma"; // adjust path as needed
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid area ID format." },
        { status: 400 }
      );
    }

    const area = await prisma.area.findUnique({ where: { id: id } });
    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area not found." },
        { status: 404 }
      );
    }

    // Delete drones linked to the area
    await prisma.drone.deleteMany({ where: { areaRef: id } });

    // Then delete the area
    await prisma.area.delete({ where: { id: id } });

    return NextResponse.json(
      {
        status: true,
        message: "Area and associated drones deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at deleteArea:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
