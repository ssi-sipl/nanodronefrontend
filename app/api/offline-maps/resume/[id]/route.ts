import { NextRequest, NextResponse } from "next/server";
import { setPaused, isTracked } from "@/lib/download-control";
import prisma from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!isTracked(id)) {
    return NextResponse.json(
      { status: false, message: "No active download found for this map." },
      { status: 404 }
    );
  }

  setPaused(id, false);
  await prisma.offlineMap.update({
    where:{id,},
    data:{status:"downloading",},
  })
  return NextResponse.json({ status: true, message: "Download resumed." }, { status: 200 });
}