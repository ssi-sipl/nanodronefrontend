import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const map = await prisma.offlineMap.findUnique({ where: { id } });

    if (!map) {
      return NextResponse.json(
        { status: false, message: "Offline map not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: true, message: "Offline map fetched successfully", data: map },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/offline-map/[id] (GET):", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}