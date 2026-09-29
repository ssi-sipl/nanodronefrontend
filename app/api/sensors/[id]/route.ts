import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const sensor = await prisma.sensor.findFirst({
      where: {
        sensor_id: id,
      },
    });

    if (!sensor) {
      return NextResponse.json(
        {
          status: false,
          message: "Sensor not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      data: sensor,
    });
  } catch (error) {
    console.error("GET SENSOR ERROR:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch sensor.",
      },
      { status: 500 }
    );
  }
}