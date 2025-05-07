"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useDroneContext } from "./drone-context";
import type { LatLngBoundsLiteral } from "leaflet";
import { baseUrl } from "@/lib/config";

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

  const DEFAULT_LAT = 28.523798;
  const DEFAULT_LNG = 77.076847;

  const bounds: LatLngBoundsLiteral = [
    [28.44961, 77.054527],
    [28.598357, 77.099167],
  ];

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch(`${baseUrl}/sensors/`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setSensors(data || []);
            console.log("Sensors fetched Successfully", data);
            import("leaflet").then((L) => {
              if (mapRef.current && !leafletMapRef.current) {
                leafletMapRef.current = L.map(mapRef.current, {
                  center: [DEFAULT_LAT, DEFAULT_LNG],
                  zoom: 15,
                  minZoom: 15,
                  maxZoom: 19,
                  maxBounds: bounds,
                  maxBoundsViscosity: 1.0,
                });

                // Custom icons
                const droneIcon = L.icon({
                  iconUrl: "/icons/drone_red.png",
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                });

                const sensorIcon = L.icon({
                  iconUrl: "/icons/application_green.png",
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40],
                });

                // Tile layer
                L.tileLayer("/tiles2/{z}/{x}/{y}.jpg", {
                  tileSize: 256,
                  noWrap: true,
                  bounds: bounds,
                  attribution: "Offline Tiles",
                  errorTileUrl: "/placeholder.jpg",
                }).addTo(leafletMapRef.current);

                // Sensor markers with click logging
                data.forEach(
                  (sensor: {
                    _id: string;
                    area_id: string;
                    latitude: number;
                    longitude: number;
                    name: string;
                    sensor_id: string;
                    __v: number;
                  }) => {
                    if (!isNaN(sensor.latitude) && !isNaN(sensor.longitude)) {
                      const marker = L.marker(
                        [sensor.latitude, sensor.longitude],
                        {
                          icon: sensorIcon,
                        }
                      )
                        .addTo(leafletMapRef.current)
                        .bindPopup(sensor.name);

                      // Log sensor details on click
                      marker.on("click", () => {
                        console.log("Sensor clicked:", sensor);
                        setCurrentSensor(sensor);
                      });
                    }
                  }
                );

                requestAnimationFrame(() => {
                  leafletMapRef.current.invalidateSize();
                });
              } else if (leafletMapRef.current) {
                leafletMapRef.current.setView([DEFAULT_LAT, DEFAULT_LNG], 15);
              }
              return;
            });
          }
        }
        // alert(response.message);
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };

    fetchSensors();
  }, [DEFAULT_LAT, DEFAULT_LNG]);

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
