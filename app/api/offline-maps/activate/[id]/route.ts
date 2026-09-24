import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    await prisma.offlineMap.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const updated = await prisma.offlineMap.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json(
      { status: true, message: `"${updated.name}" is now the active map.`, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/offline-maps/activate/[id]:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}