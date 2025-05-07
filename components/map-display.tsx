// "use client";

// import { useEffect, useRef } from "react";
// import "leaflet/dist/leaflet.css";
// import { useDroneContext } from "./drone-context";
// import type { LatLngBoundsLiteral } from "leaflet";

// const sensors = [
//   {
//     name: "Camera 1",
//     sensor_id: "sensor_001",
//     area_id: "area_001",
//     latitude: 28.459497,
//     longitude: 77.026638,
//   },
//   {
//     name: "Camera 2",
//     sensor_id: "sensor_002",
//     area_id: "area_001",
//     latitude: 28.474349,
//     longitude: 77.045135,
//   },
//   {
//     name: "Camera 3",
//     sensor_id: "sensor_003",
//     area_id: "area_002",
//     latitude: 28.489010,
//     longitude: 77.065247,
//   },
// ];

// export default function MapDisplay() {
//   const { area } = useDroneContext();
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const leafletMapRef = useRef<any>(null);

//   const lat = parseFloat(area.latitude);
//   const lng = parseFloat(area.longitude);
//   const isValidCoordinates = !isNaN(lat) && !isNaN(lng);

//   // Define bounds to limit the panning area (adjust based on your tile coverage)
//   // const southWest = [28.44961, 77.054527]; // min lat, min lng
//   // const northEast = [28.598357, 77.099167]; // max lat, max lng
//   const bounds: LatLngBoundsLiteral = [
//     [28.44961, 77.054527], // southwest
//     [28.598357, 77.099167], // northeast
//   ];

//   useEffect(() => {
//     if (!isValidCoordinates) return;

//     import("leaflet").then((L) => {
//       if (mapRef.current && !leafletMapRef.current) {
//         leafletMapRef.current = L.map(mapRef.current, {
//           center: [lat, lng],
//           zoom: 15,
//           minZoom: 15,
//           maxZoom: 19,
//           maxBounds: bounds,
//           maxBoundsViscosity: 1.0, // 1.0 = completely restrict movement beyond bounds
//         });

//         const customIcon = L.icon({
//           iconUrl: "/icons/drone.png",
//           iconSize: [40, 40],
//           iconAnchor: [20, 40],
//           popupAnchor: [0, -40],
//         });

//         L.tileLayer("/tiles2/{z}/{x}/{y}.jpg", {
//           tileSize: 256,
//           noWrap: true,
//           bounds: bounds,
//           attribution: "Offline Tiles",
//           errorTileUrl: "/placeholder.jpg",
//         }).addTo(leafletMapRef.current);

//         L.marker([lat, lng], { icon: customIcon })
//           .addTo(leafletMapRef.current)
//           .bindPopup("Drone Location")
//           .openPopup();

//         requestAnimationFrame(() => {
//           leafletMapRef.current.invalidateSize();
//         });
//       } else if (leafletMapRef.current) {
//         leafletMapRef.current.setView([lat, lng], 15);
//       }
//     });
//   }, [lat, lng, isValidCoordinates]);

//   return (
//     <div className="w-full h-full rounded-lg border shadow overflow-hidden">
//       {isValidCoordinates ? (
//         <div
//           ref={mapRef}
//           id="leaflet-map"
//           style={{ width: "100%", height: "100%" }}
//         />
//       ) : (
//         <p className="text-sm text-gray-500 text-center p-4">
//           Please update the map lat long in the settings.
//         </p>
//       )}
//     </div>
//   );
// }
////////////////////////////////////////////////////////////////////////////////
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
    latitude: 28.5592725,
    longitude: 77.0666248,
  },
  {
    name: "Camera 2",
    sensor_id: "sensor_002",
    area_id: "area_001",
    latitude: 28.5592725,
    longitude: 77.0722467,
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
  const { area } = useDroneContext();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  const lat = parseFloat(area.latitude);
  const lng = parseFloat(area.longitude);
  const isValidCoordinates = !isNaN(lat) && !isNaN(lng);

  const bounds: LatLngBoundsLiteral = [
    [28.44961, 77.054527],
    [28.598357, 77.099167],
  ];

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

        // Drone marker
        L.marker([lat, lng], { icon: droneIcon })
          .addTo(leafletMapRef.current)
          .bindPopup("Drone Location")
          .openPopup();

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
        leafletMapRef.current.setView([lat, lng], 15);
      }
    });
  }, [lat, lng, isValidCoordinates]);

  return (
    <div className="w-full h-full rounded-lg border shadow overflow-hidden">
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
