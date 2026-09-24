import fs from "fs/promises";
import path from "path";
import { isCancelled, isPaused } from "./download-control";

export const MAX_TILES_PER_DOWNLOAD = 2500;
const TILE_REQUEST_DELAY_MS = 200; // matches the reference script's pacing for this server
const PAUSE_POLL_MS = 300;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

// Esri World Imagery (satellite) — free, no API key required.
// Note: this server's path order is {z}/{y}/{x}, not the usual {z}/{x}/{y}.
const TILE_URL_TEMPLATE =
  process.env.OFFLINE_MAP_TILE_URL_TEMPLATE ||
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILE_EXTENSION = process.env.OFFLINE_MAP_TILE_EXTENSION || "jpg";

function buildTileUrl(zoom: number, x: number, y: number): string {
  return TILE_URL_TEMPLATE.replace("{z}", String(zoom))
    .replace("{y}", String(y))
    .replace("{x}", String(x));
}

function clampLat(lat: number) {
  return Math.max(-85.0511, Math.min(85.0511, lat));
}

function lon2tileX(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tileY(lat: number, zoom: number) {
  const latRad = (clampLat(lat) * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

export type TileRange = { zoom: number; xMin: number; xMax: number; yMin: number; yMax: number };

export function computeTileRanges(
  north: number,
  south: number,
  east: number,
  west: number,
  minZoom: number,
  maxZoom: number
): TileRange[] {
  const ranges: TileRange[] = [];
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    ranges.push({
      zoom,
      xMin: lon2tileX(west, zoom),
      xMax: lon2tileX(east, zoom),
      yMin: lat2tileY(north, zoom),
      yMax: lat2tileY(south, zoom),
    });
  }
  return ranges;
}

export function countTiles(ranges: TileRange[]): number {
  return ranges.reduce(
    (sum, r) => sum + (r.xMax - r.xMin + 1) * (r.yMax - r.yMin + 1),
    0
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function downloadTiles(
  mapId: string,
  ranges: TileRange[],
  onProgress: (downloaded: number, failed: number, total: number) => void
) {
  const total = countTiles(ranges);
  let downloaded = 0;
  let failed = 0;

  const baseDir = path.join(process.cwd(), "public", "offline-maps", mapId);

  for (const range of ranges) {
    for (let x = range.xMin; x <= range.xMax; x++) {
      for (let y = range.yMin; y <= range.yMax; y++) {
        if (isCancelled(mapId)) {
          return { downloaded, failed, total, cancelled: true };
        }

        while (isPaused(mapId)) {
          await delay(PAUSE_POLL_MS);
          if (isCancelled(mapId)) {
            return { downloaded, failed, total, cancelled: true };
          }
        }

        const tileDir = path.join(baseDir, String(range.zoom), String(x));
        const tilePath = path.join(tileDir, `${y}.${TILE_EXTENSION}`);

        try {
          await fs.access(tilePath);
          downloaded++;
          onProgress(downloaded, failed, total);
          continue;
        } catch {
        }

        try {
          await fs.mkdir(tileDir, { recursive: true });

          const url = buildTileUrl(range.zoom, x, y);
          const res = await fetch(url, {
            headers: { "User-Agent": USER_AGENT },
          });

          if (!res.ok) {
            failed++;
          } else {
            const buffer = Buffer.from(await res.arrayBuffer());
            await fs.writeFile(tilePath, buffer);
            downloaded++;
          }
        } catch {
          failed++;
        }

        onProgress(downloaded, failed, total);
        await delay(TILE_REQUEST_DELAY_MS);
      }
    }
  }

  return { downloaded, failed, total, cancelled: false };
}

export async function deleteMapTiles(mapId: string) {
  const baseDir = path.join(process.cwd(), "public", "offline-maps", mapId);
  await fs.rm(baseDir, { recursive: true, force: true });
}