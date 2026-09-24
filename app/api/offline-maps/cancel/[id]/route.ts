import { NextResponse } from "next/server";
import { requestCancel, isTracked} from "@/lib/download-control";
import prisma from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("[cancel] ID:", id);

  if (!isTracked(id)) {
    return NextResponse.json(
      {
        status: false,
        message: "No active download found for this map.",
      },
      { status: 404 }
    );
  }

 
  requestCancel(id); 

  return NextResponse.json({
    status: true,
    message: "Download cancellation requested.",
  });
}