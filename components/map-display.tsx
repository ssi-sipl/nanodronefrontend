"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useDroneContext } from "./drone-context";
import type { LatLngBoundsLiteral } from "leaflet";

const sensors = [
  {
    name: "Camera 1",
    sensor_id: "sensor_001",
    area_id: "area_001",
    latitude: 28.523798,
    longitude: 77.076847,
  },
  {
    name: "Camera 2",
    sensor_id: "sensor_002",
    area_id: "area_001",
    latitude: 28.5592726,
    longitude: 77.076849,
  },
  {
    name: "Camera 3",
    sensor_id: "sensor_003",
    area_id: "area_002",
    latitude: 28.560676,
    longitude: 77.059569,
  },
];

export default function MapDisplay() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  const DEFAULT_LAT = 28.523798;
  const DEFAULT_LNG = 77.076847;

  const bounds: LatLngBoundsLiteral = [
    [28.44961, 77.054527],
    [28.598357, 77.099167],
  ];

  useEffect(() => {
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
        sensors.forEach((sensor) => {
          if (!isNaN(sensor.latitude) && !isNaN(sensor.longitude)) {
            const marker = L.marker([sensor.latitude, sensor.longitude], {
              icon: sensorIcon,
            })
              .addTo(leafletMapRef.current)
              .bindPopup(sensor.name);

            // Log sensor details on click
            marker.on("click", () => {
              console.log("Sensor clicked:", sensor);
            });
          }
        });

        requestAnimationFrame(() => {
          leafletMapRef.current.invalidateSize();
        });
      } else if (leafletMapRef.current) {
        leafletMapRef.current.setView([DEFAULT_LAT, DEFAULT_LNG], 15);
      }
    });
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
