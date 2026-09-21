"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type OfflineMap = {
  id: string;
  name: string;
  north: number;
  south: number;
  east: number;
  west: number;
  minZoom: number;
  maxZoom: number;
  folderPath: string;
};

export default function OfflineMapViewerPage() {
  const params = useParams();
  const id = params?.id as string;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const [map, setMap] = useState<OfflineMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/offline-maps/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (data.status) setMap(data.data);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!map || !mapRef.current || leafletMapRef.current) return;

    const bounds: [[number, number], [number, number]] = [
      [map.north, map.west],
      [map.south, map.east],
    ];

    leafletMapRef.current = L.map(mapRef.current, {
      minZoom: map.minZoom,
      maxZoom: map.maxZoom,
    }).fitBounds(bounds);

    L.tileLayer(`${map.folderPath}/{z}/{x}/{y}.png`, {
      tileSize: 256,
      noWrap: true,
      bounds,
      errorTileUrl: "/placeholder.jpg",
      attribution: "\u00a9 OpenStreetMap contributors",
    }).addTo(leafletMapRef.current);

    L.rectangle(bounds, { color: "#3388ff", weight: 1, fill: false }).addTo(leafletMapRef.current);
  }, [map]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold">{map?.name || "Offline Map"}</h1>
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading map...</p>
      ) : !map ? (
        <p className="text-center text-muted-foreground py-12">Map not found.</p>
      ) : (
        <div ref={mapRef} className="w-full h-[70vh] rounded-lg border" />
      )}
    </div>
  );
}