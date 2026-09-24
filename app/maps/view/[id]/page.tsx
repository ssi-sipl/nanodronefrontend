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
        console.log(data);
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
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    }).fitBounds(bounds);

    L.tileLayer(`${map.folderPath}/{z}/{x}/{y}.jpg`, {
      tileSize: 256,
      noWrap: true,
      bounds,
      errorTileUrl: "/placeholder.jpg",
      attribution: "\u00a9 Esri \u2014 Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    }).addTo(leafletMapRef.current);
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