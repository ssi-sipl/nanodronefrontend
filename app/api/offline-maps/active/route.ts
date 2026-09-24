import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[ACTIVE MAP] querying...");

    const activeMap = await prisma.offlineMap.findFirst({
      where: {
        isActive: true,
        status: "completed",
      },
    });

    console.log("[ACTIVE MAP] result:", activeMap);

    return NextResponse.json({
      status: true,
      message: "Active map fetched",
      data: activeMap,
    });
  }  catch (error) {
  console.error(
    "[ACTIVE MAP] PRISMA ERROR:",
    JSON.stringify(error, null, 2)
  );

  return NextResponse.json(
    {
      status: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}
}