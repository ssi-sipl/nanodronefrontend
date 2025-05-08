"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsLiteral } from "leaflet";
import { baseUrl } from "@/lib/config";
import L from "leaflet";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface MapDisplayProps {
  setCurrentSensor: (sensor: Sensor | null) => void;
}

export default function MapDisplay({ setCurrentSensor }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [clickMode, setClickMode] = useState(false);
  const clickModeRef = useRef(false);

  const DEFAULT_LAT = 28.523798;
  const DEFAULT_LNG = 77.076847;

  const bounds: LatLngBoundsLiteral = [
    [28.44961, 77.054527],
    [28.598357, 77.099167],
  ];

  // ✅ Define the icon globally so it works inside any scope
  const sensorIcon = L.icon({
    iconUrl: "/icons/application_green.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch(`${baseUrl}/sensors/`);
        const response = await res.json();

        if (response.status && response.data) {
          const data = response.data;
          setSensors(data || []);
          console.log("Sensors fetched Successfully", data);

          if (mapRef.current && !leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current, {
              center: [DEFAULT_LAT, DEFAULT_LNG],
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

            data.forEach((sensor: Sensor) => {
              if (!isNaN(sensor.latitude) && !isNaN(sensor.longitude)) {
                const marker = L.marker([sensor.latitude, sensor.longitude], {
                  icon: sensorIcon,
                })
                  .addTo(leafletMapRef.current)
                  .bindPopup(sensor.name);

                marker.on("click", () => {
                  console.log("Sensor clicked:", sensor);
                  setCurrentSensor(sensor);
                });
              }
            });

            // ✅ Add click event listener on the map
            leafletMapRef.current.on("click", (e: any) => {
              if (clickModeRef.current) {
                console.log("Clicked LatLng:", e.latlng.lat, e.latlng.lng);

                // ✅ Marker will now correctly appear
                L.marker([e.latlng.lat, e.latlng.lng], {
                  icon: sensorIcon,
                }).addTo(leafletMapRef.current);
              }
            });

            requestAnimationFrame(() => {
              leafletMapRef.current.invalidateSize();
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };

    fetchSensors();
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    const mapEl = leafletMapRef.current.getContainer();
    mapEl.style.cursor = clickMode ? "crosshair" : "";
  }, [clickMode]);

  return (
    <div className="w-full h-full relative rounded-lg border shadow overflow-hidden">
      {/* Floating Icon Button */}
      <button
        className="absolute z-[1000] top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 border border-gray-300"
        onClick={() => {
          setClickMode((prev) => {
            const newState = !prev;
            clickModeRef.current = newState;
            return newState;
          });
        }}
        title={clickMode ? "Disable LatLng Picker" : "Enable LatLng Picker"}
      >
        <img
          src="/icons/pin.png"
          alt="Pick Location"
          className={`w-6 h-6 ${clickMode ? "opacity-100" : "opacity-50"}`}
        />
      </button>

      {/* Map container */}
      <div
        ref={mapRef}
        id="leaflet-map"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
