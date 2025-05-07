"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useDroneContext } from "./drone-context";

export default function MapDisplay() {
  const { area } = useDroneContext();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  const lat = parseFloat(area.latitude);
  const lng = parseFloat(area.longitude);
  const isValidCoordinates = !isNaN(lat) && !isNaN(lng);

  // Define bounds to limit the panning area (adjust based on your tile coverage)
  const southWest = [28.449610, 77.054527]; // min lat, min lng
  const northEast = [28.598357, 77.099167]; // max lat, max lng
  const bounds = [southWest, northEast];

  useEffect(() => {
    if (!isValidCoordinates) return;

    import("leaflet").then((L) => {
      if (mapRef.current && !leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 15,
          minZoom: 15,
          maxZoom: 19,
          maxBounds: bounds,
          maxBoundsViscosity: 1.0, // 1.0 = completely restrict movement beyond bounds
        });

        const customIcon = L.icon({
          iconUrl: "/icons/drone.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        L.tileLayer("/tiles2/{z}/{x}/{y}.jpg", {
          tileSize: 256,
          noWrap: true,
          bounds: bounds,
          attribution: "Offline Tiles",
          errorTileUrl: "/placeholder.jpg",
        }).addTo(leafletMapRef.current);

        L.marker([lat, lng], { icon: customIcon })
          .addTo(leafletMapRef.current)
          .bindPopup("Drone Location")
          .openPopup();

        requestAnimationFrame(() => {
          leafletMapRef.current.invalidateSize();
        });
      } else if (leafletMapRef.current) {
        leafletMapRef.current.setView([lat, lng], 15);
      }
    });
  }, [lat, lng, isValidCoordinates]);

  return (
    <div className="w-full h-[400px] rounded-lg border shadow overflow-hidden">
      {isValidCoordinates ? (
        <div
          ref={mapRef}
          id="leaflet-map"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <p className="text-sm text-gray-500 text-center p-4">
          Please update the map lat long in the settings.
        </p>
      )}
    </div>
  );
}
