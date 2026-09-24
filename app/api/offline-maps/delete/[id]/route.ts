import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteMapTiles } from "@/lib/offline-map";

export async function POST(
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

    await deleteMapTiles(id);
    await prisma.offlineMap.delete({ where: { id } });

    return NextResponse.json(
      { status: true, message: "Offline map deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/offline-map/delete/[id]:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}