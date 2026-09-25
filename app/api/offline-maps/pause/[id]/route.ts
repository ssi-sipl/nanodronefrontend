import { NextRequest, NextResponse } from "next/server";
import { setPaused, isTracked } from "@/lib/download-control";
import prisma from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try{
  const { id } = await params;

  if (!isTracked(id)) {
    return NextResponse.json(
      { status: false, message: "No active download found for this map." },
      { status: 404 }
    );
  }

  setPaused(id, true);

  await prisma.offlineMap.update({
    where: {id,},
    data: {status: "paused",},
  });
  return NextResponse.json({ status: true, message: "Download paused." }, { status: 200 });
}catch(error){
  console.log("Error at pause:",error);
  return NextResponse.json(
    {status:false, message:"Internal server error"},
    {status:500} 
  )
}
}