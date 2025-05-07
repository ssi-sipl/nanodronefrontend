"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useDroneContext } from "./drone-context";
import type { LatLngBoundsLiteral } from "leaflet";

export default function MapDisplay() {
  const { area } = useDroneContext();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  const DEFAULT_LAT = 28.523798;
  const DEFAULT_LNG = 77.076847;

  const lat = !isNaN(parseFloat(area.latitude))
    ? parseFloat(area.latitude)
    : DEFAULT_LAT;

  const lng = !isNaN(parseFloat(area.longitude))
    ? parseFloat(area.longitude)
    : DEFAULT_LNG;

  const bounds: LatLngBoundsLiteral = [
    [28.44961, 77.054527],
    [28.598357, 77.099167],
  ];

  useEffect(() => {
    import("leaflet").then((L) => {
      if (mapRef.current && !leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 15,
          minZoom: 15,
          maxZoom: 19,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0,
        });

        L.tileLayer("/tiles2/{z}/{x}/{y}.jpg", {
          tileSize: 256,
          noWrap: true,
          bounds: bounds,
          attribution: "Offline Tiles",
          errorTileUrl: "/placeholder.jpg",
        }).addTo(leafletMapRef.current);

        requestAnimationFrame(() => {
          leafletMapRef.current.invalidateSize();
        });
      } else if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 15);
      }
    });
  }, [lat, lng]);

  return (
    <div className="w-full h-full rounded-lg border shadow overflow-hidden">
      <div
        ref={mapRef}
        id="leaflet-map"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
