"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useDroneContext } from "./drone-context";

export default function MapDisplay() {
  const { area } = useDroneContext();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null); // We'll define L inside useEffect

  const lat = parseFloat(area.latitude);
  const lng = parseFloat(area.longitude);
  const isValidCoordinates = !isNaN(lat) && !isNaN(lng);

  useEffect(() => {
    if (!isValidCoordinates) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (mapRef.current && !leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView([lat, lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(leafletMapRef.current);

        L.marker([lat, lng])
          .addTo(leafletMapRef.current)
          .bindPopup("Current Location")
          .openPopup();
      } else if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 13);

        L.marker([lat, lng])
          .addTo(leafletMapRef.current)
          .bindPopup("Updated Location")
          .openPopup();
      }
    });
  }, [lat, lng, isValidCoordinates]);

  return (
    <div className="w-full h-[400px] rounded-lg border shadow flex items-center justify-center">
      {isValidCoordinates ? (
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      ) : (
        <p className="text-sm text-gray-500">
          Please update the map lat long in the settings.
        </p>
      )}
    </div>
  );
}
