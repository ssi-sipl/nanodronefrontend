"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLngBoundsLiteral } from "leaflet";
import { baseUrl } from "@/lib/config";
import L from "leaflet";

import { Button } from "./ui/button";
import { SensorSettings } from "./sensor-settings";
import { CloudLightning } from "lucide-react";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

type Area = {
  name: string;
  area_id: string;
};

interface MapDisplayProps {
  setCurrentSensor: (sensor: Sensor | null) => void;
}

export default function MapDisplay({ setCurrentSensor }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [clickMode, setClickMode] = useState(false);
  const clickModeRef = useRef(false);
  const [clickAddSensor, setClickAddSensor] = useState(false);
  const clickAddSensorRef = useRef(false);

  const [addSensorLat, setAddSensorLat] = useState(0);
  const [addSensorLng, setAddSensorLng] = useState(0);

  const [sensorAddSuccess, setSensorAddSuccess] = useState(false);
  const [refreshSensorList, setRefreshSensorList] = useState(false);

  // Sector 32
  // // ✅ Updated configuration to match tile download script
  // const DEFAULT_LAT = 28.44796;
  // const DEFAULT_LNG = 77.040915;

  // // Bounds matching the downloaded tiles (NE to SW diagonal)
  // const bounds: LatLngBoundsLiteral = [
  //   [28.456969, 77.048835], // North-East corner
  //   [28.438951, 77.033995], // South-West corner
  // ];

  // ✅ Updated configuration to match tile download script
  const DEFAULT_LAT = 28.587506;
  const DEFAULT_LNG = 77.147572;

  // Bounds matching the downloaded tiles (NE to SW diagonal)
  const bounds: LatLngBoundsLiteral = [
    [28.59648911174991, 77.15780231690938], // North-East corner
    [28.57852288825009, 77.13734168309061], // South-West corner
  ];

  // ✅ Define the sensor icon
  const sensorIcon = L.icon({
    iconUrl: "/icons/sensor_icon3.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        console.log("Sensor Refresh Triggered");
        const res = await fetch(`${baseUrl}/sensors/`);
        const response = await res.json();

        if (response.status && response.data) {
          const data = response.data;
          setSensors(data || []);
          console.log("Sensors fetched Successfully", data);

          // Check if the map is initialized, if not initialize it
          if (mapRef.current && !leafletMapRef.current) {
            leafletMapRef.current = L.map(mapRef.current, {
              center: [DEFAULT_LAT, DEFAULT_LNG],
              zoom: 15,
              minZoom: 15,
              maxZoom: 20,
              maxBounds: bounds,
              maxBoundsViscosity: 1.0,
            });

            // Add the tile layer to the map with proper attribution
            L.tileLayer("/manekshaw/{z}/{x}/{y}.jpg", {
              tileSize: 256,
              noWrap: true,
              bounds: bounds,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              errorTileUrl: "/placeholder.jpg",
            }).addTo(leafletMapRef.current);
          }

          // Clear existing markers before adding new ones
          leafletMapRef.current?.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              leafletMapRef.current.removeLayer(layer);
            }
          });

          // Add markers for the fetched sensors
          data.forEach((sensor: Sensor) => {
            if (!isNaN(sensor.latitude) && !isNaN(sensor.longitude)) {
              const marker = L.marker([sensor.latitude, sensor.longitude], {
                icon: sensorIcon,
              })
                .addTo(leafletMapRef.current)
                .bindPopup(sensor.name);

              marker.on("click", () => {
                console.log("Sensor clicked:", sensor);
                setCurrentSensor({ ...sensor });
              });
            }
          });

          // Add click event listener to the map
          leafletMapRef.current?.on("click", (e: any) => {
            if (clickModeRef.current) {
              console.log("Clicked LatLng:", e.latlng.lat, e.latlng.lng);
              if (clickAddSensorRef.current) {
                setAddSensorLat(e.latlng.lat);
                setAddSensorLng(e.latlng.lng);
              } else {
                setCurrentSensor({
                  __v: 0,
                  _id: "",
                  area_id: "",
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng,
                  name: "New Sensor",
                  sensor_id: "",
                });
              }

              // Add a marker at the clicked position
              L.marker([e.latlng.lat, e.latlng.lng], {
                icon: sensorIcon,
              }).addTo(leafletMapRef.current);
            }
          });

          // Invalidate the size of the map to ensure it's rendered properly
          requestAnimationFrame(() => {
            leafletMapRef.current.invalidateSize();
          });
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      }
    };

    fetchSensors();
  }, [refreshSensorList]);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    const mapEl = leafletMapRef.current.getContainer();
    mapEl.style.cursor = clickMode ? "crosshair" : "";
  }, [clickMode]);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    clickAddSensorRef.current = clickAddSensor;
  }, [clickAddSensor]);

  useEffect(() => {
    if (sensorAddSuccess) {
      setClickAddSensor(false);
      setSensorAddSuccess(false);
      setClickMode(false);
      clickModeRef.current = false;
      clickAddSensorRef.current = false;
      setAddSensorLat(0);
      setAddSensorLng(0);
      setRefreshSensorList((prev) => !prev);
    }
  }, [sensorAddSuccess]);

  return (
    <div className="w-full h-full relative rounded-lg border shadow ">
      {/* Floating Icon Button */}
      <div className="absolute z-[1000] top-4 right-4 flex flex-row gap-4">
        <button
          className=" bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 border border-gray-300"
          onClick={() => {
            setClickMode((prev) => {
              const newState = true;
              clickModeRef.current = newState;
              return newState;
            });
            setClickAddSensor(true);
          }}
          title={clickAddSensor ? "Disable Add Sensor" : "Enable Add Sensor"}
        >
          Add Sensor
        </button>
        <button
          className=" bg-white p-2 rounded-full shadow hover:bg-gray-100 border border-gray-300"
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
      </div>
      {clickAddSensor && (
        <div className="absolute z-[1000] top-4 left-4">
          <SensorSettings
            addSensorLat={addSensorLat}
            addSensorLng={addSensorLng}
            disableLatLng={true}
            setSensorAddSuccess={setSensorAddSuccess}
          />
          <div className="absolute top-4 right-4 flex flex-row gap-4 z-[1001]">
            <Button
              onClick={() => {
                setClickAddSensor(false);
                setClickMode(false);
              }}
              className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 border border-gray-300 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        id="leaflet-map"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
