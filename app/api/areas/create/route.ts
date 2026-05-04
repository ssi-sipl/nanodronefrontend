import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust the import path as needed

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { name, area_id } = body;

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

    const existingArea = await prisma.area.findFirst({
      where: {
        OR: [
          { name: name.toLocaleLowerCase().trim() },
          { area_id: area_id.toLocaleLowerCase().trim() },
        ],
      },
    });

    if (existingArea) {
      return NextResponse.json(
        {
          status: false,
          message: "An area with this name or area_id already exists.",
        },
        { status: 409 }
      );
    }

    const newArea = await prisma.area.create({
      data: {
        name: name.toLocaleLowerCase().trim(),
        area_id: area_id.toLocaleLowerCase().trim(),
      },
    });

    return NextResponse.json(
      {
        status: true,
        message: "Area added successfully",
        data: newArea,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error at createArea:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
