import prisma from "@/lib/prisma"; // adjust path as needed
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { status: false, message: "Invalid area ID format." },
        { status: 400 }
      );
    }

    const area = await prisma.area.findUnique({ where: { id: parseInt(id) } });
    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area not found." },
        { status: 404 }
      );
    }

    // Delete drones linked to the area
    await prisma.drone.deleteMany({ where: { areaRef: parseInt(id) } });

    // Then delete the area
    await prisma.area.delete({ where: { id: parseInt(id) } });

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
