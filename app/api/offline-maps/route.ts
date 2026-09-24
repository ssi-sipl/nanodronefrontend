import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const maps = await prisma.offlineMap.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { status: true, message: "Offline maps fetched successfully", data: maps },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/offline-maps (GET):", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}