import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeTileRanges, countTiles, downloadTiles,deleteMapTiles, MAX_TILES_PER_DOWNLOAD } from "@/lib/offline-map";
import { registerDownload, clearDownload } from "@/lib/download-control";

const DB_WRITE_THROTTLE_TILES = 10; 
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { status: false, message: "Missing request body" },
      { status: 400 }
    );
  }

  const { name, description, north, south, east, west, minZoom, maxZoom } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json(
      { status: false, message: 'Invalid input: "name" is required.' },
      { status: 400 }
    );
  }

  const nums = { north, south, east, west, minZoom, maxZoom };
  for (const [key, value] of Object.entries(nums)) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return NextResponse.json(
        { status: false, message: `Invalid input: "${key}" must be a number.` },
        { status: 400 }
      );
    }
  }

  if (north <= south) {
    return NextResponse.json(
      { status: false, message: "North latitude must be greater than South latitude." },
      { status: 400 }
    );
  }
  if (east <= west) {
    return NextResponse.json(
      { status: false, message: "East longitude must be greater than West longitude." },
      { status: 400 }
    );
  }
  if (minZoom < 1 || maxZoom > 19 || minZoom > maxZoom) {
    return NextResponse.json(
      { status: false, message: "Zoom range must be between 1 and 19, with min \u2264 max." },
      { status: 400 }
    );
  }

  const ranges = computeTileRanges(north, south, east, west, minZoom, maxZoom);
  const totalTiles = countTiles(ranges);

  if (totalTiles === 0) {
    return NextResponse.json(
      { status: false, message: "The selected area/zoom range produces no tiles." },
      { status: 400 }
    );
  }

  if (totalTiles > MAX_TILES_PER_DOWNLOAD) {
    return NextResponse.json(
      {
        status: false,
        message: `This would download ${totalTiles} tiles, which exceeds the limit of ${MAX_TILES_PER_DOWNLOAD}. Reduce the area or the zoom range.`,
      },
      { status: 400 }
    );
  }

  const mapRecord = await prisma.offlineMap.create({
    data: {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      north,
      south,
      east,
      west,
      minZoom,
      maxZoom,
      totalTiles,
      status: "downloading",
      folderPath: "",
    },
  });

  await prisma.offlineMap.update({
    where: { id: mapRecord.id },
    data: { folderPath: `/offline-maps/${mapRecord.id}` },
  });

  registerDownload(mapRecord.id);

  (async () => {
    let lastPersistedCount = 0;

    try {
      const result = await downloadTiles(mapRecord.id, ranges, (downloaded, failed) => {
        const attempted = downloaded + failed;
        if (attempted - lastPersistedCount >= DB_WRITE_THROTTLE_TILES) {
          lastPersistedCount = attempted;
          prisma.offlineMap
            .update({
              where: { id: mapRecord.id },
              data: { downloadedTiles: downloaded, failedTiles: failed },
            })
            .catch((err) => console.error("Failed to persist download progress:", err));
        }
      });

     if (result.cancelled) {
  console.log("[download] Cancellation detected:", mapRecord.id);
  await deleteMapTiles(mapRecord.id);
  await prisma.offlineMap.delete({
    where: {
      id: mapRecord.id,
    },
  });

  console.log(
    "[download] Cancelled map deleted:",
    mapRecord.id
  );

  return;
}
await prisma.offlineMap.update({
  where: { id: mapRecord.id },
  data: {
    status: "completed",
    downloadedTiles: result.downloaded,
    failedTiles: result.failed,
  },
});
    } catch (error) {
      console.error("Offline map download failed:", mapRecord.id, error);
      await prisma.offlineMap
        .update({
          where: { id: mapRecord.id },
          data: { status: "failed" },
        })
        .catch(() => {});
    } finally {
      clearDownload(mapRecord.id);
    }
  })();

  return NextResponse.json(
    {
      status: true,
      message: "Download started",
      data: { mapId: mapRecord.id, totalTiles },
    },
    { status: 200 }
  );
}