import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path as needed

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, area_id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { status: false, message: "Invalid area ID format." },
        { status: 400 }
      );
    }

    const existingArea = await prisma.area.findUnique({
      where: { id: id },
    });

    if (!existingArea) {
      return NextResponse.json(
        { status: false, message: "Area not found." },
        { status: 404 }
      );
    }

    const conflict = await prisma.area.findFirst({
      where: {
        id: { not: id },
        OR: [{ name }, { area_id }],
      },
    });

    if (conflict) {
      return NextResponse.json(
        {
          status: false,
          message: "Another area with this name or area_id already exists.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.area.update({
      where: { id: id },
      data: {
        name,
        area_id,
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Area updated successfully.",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at updateArea:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
