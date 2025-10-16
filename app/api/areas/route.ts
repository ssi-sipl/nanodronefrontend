import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust the import path as needed

export async function GET() {
  try {
    const areas = await prisma.area.findMany();

    if (!areas.length) {
      return NextResponse.json(
        { status: true, message: "No areas found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        message: "Areas fetched successfully",
        data: areas,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at getAllAreas:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
