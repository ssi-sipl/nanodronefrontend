import prisma from "@/lib/prisma"; // adjust path as needed
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const drones = await prisma.drone.findMany({
      include: {
        area: true, // Include related area data
      },
    });

    if (!drones || drones.length === 0) {
      return NextResponse.json(
        { status: true, message: "No drones found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Drones fetched successfully",
        data: drones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at controllers/droneController/getAllDrones: ", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
