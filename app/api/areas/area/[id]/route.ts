import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const area = await prisma.area.findUnique({
      where: { id: parseInt(id) },
      include: {
        drones: true, // populating drones
      },
    });

    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Area fetched successfully",
        data: area,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at getAreaById:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
