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
  cameraFeed?: string | null;
}

type Area = {
  name: string;
  area_id: string;
};

interface MapDisplayProps {
  setCurrentSensor: (sensor: Sensor | null) => void;
}

const escapePopupText = (value: string) =>
  value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!
  );

export default function MapDisplay({ setCurrentSensor }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const addSensorMarkerRef = useRef<L.Marker | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [clickMode, setClickMode] = useState(false);
  const clickModeRef = useRef(false);
  const [clickAddSensor, setClickAddSensor] = useState(false);
  const clickAddSensorRef = useRef(false);

  const [addSensorLat, setAddSensorLat] = useState(0);
  const [addSensorLng, setAddSensorLng] = useState(0);

  const [sensorAddSuccess, setSensorAddSuccess] = useState(false);
  const [refreshSensorList, setRefreshSensorList] = useState(false);
  const fakeSensorsLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeOfflineMap, setActiveOfflineMap] = useState<{
    folderPath: string;
    north: number;
    south: number;
    east: number;
    west: number;
    minZoom: number;
    maxZoom: number;
  } | null>(null);
  const [activeMapLoaded, setActiveMapLoaded] = useState(false);

  useEffect(() => {
    const fetchActiveMap = async () => {
      try {
        const res = await fetch(`${baseUrl}/offline-maps/active`);
        const data = await res.json();
        if (data.status && data.data) {
          setActiveOfflineMap(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch active offline map:", error);
      } finally {
        setActiveMapLoaded(true);
      }
    };
    fetchActiveMap();
  }, []);

  // ✅ Define the sensor icon
  const sensorIcon = L.icon({
    iconUrl: "/icons/sensor_icon3.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    const fetchSensors = async () => {
      if (!activeMapLoaded) return;

      if (!activeOfflineMap) {
        console.log("No offline map available.");
        return;
      }
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
            if (!activeOfflineMap) {
              console.log("No offline map available.");
              return;
            }

            const activeBounds: [[number, number], [number, number]] = [
              [activeOfflineMap.north, activeOfflineMap.west],
              [activeOfflineMap.south, activeOfflineMap.east],
            ];

            const center: [number, number] = [
              (activeOfflineMap.north + activeOfflineMap.south) / 2,
              (activeOfflineMap.east + activeOfflineMap.west) / 2,
            ];

            leafletMapRef.current = L.map(mapRef.current, {
              center,
              zoom: activeOfflineMap ? activeOfflineMap.minZoom : 15,
              minZoom: activeOfflineMap ? activeOfflineMap.minZoom : 15,
              maxZoom: activeOfflineMap ? activeOfflineMap.maxZoom : 18,
              maxBounds: activeBounds,
              maxBoundsViscosity: 1.0,
            });
            fakeSensorsLayerRef.current = L.layerGroup().addTo(
              leafletMapRef.current
            );

            const tileUrl = `${activeOfflineMap.folderPath}/{z}/{x}/{y}.jpg`;

            L.tileLayer(tileUrl, {
              tileSize: 256,
              noWrap: true,
              bounds: activeBounds,
              attribution: "\u00a9 Esri \u2014 Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
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
                .bindPopup(`
                  <div class="min-w-36">
                    <p class="mb-2 font-medium">${escapePopupText(sensor.name)}</p>
                    ${sensor.cameraFeed ? `<button
                      type="button"
                      data-stream-id="${encodeURIComponent(sensor.sensor_id)}"
                      class="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
                    >Open live stream</button>` : '<p class="text-sm text-slate-500">No RTSP feed configured</p>'}
                  </div>
                `);

              marker.on("click", () => {
                console.log("Sensor clicked:", sensor);
                setCurrentSensor({ ...sensor });
              });

              marker.on("popupopen", () => {
                const streamButton = document.querySelector<HTMLButtonElement>(
                  `button[data-stream-id="${encodeURIComponent(sensor.sensor_id)}"]`
                );
                streamButton?.addEventListener(
                  "click",
                  () => window.location.assign(`/live-view?stream=${encodeURIComponent(sensor.sensor_id)}`),
                  { once: true }
                );
              });
            }
          });

          // Add click event listener to the map
          leafletMapRef.current?.on("click", (e: any) => {
            if (!clickModeRef.current) return;

            console.log("Clicked LatLng:", e.latlng.lat, e.latlng.lng);


            if (clickAddSensorRef.current) {
              setAddSensorLat(e.latlng.lat);
              setAddSensorLng(e.latlng.lng);

              if (addSensorMarkerRef.current) {
                leafletMapRef.current?.removeLayer(
                  addSensorMarkerRef.current
                );

                addSensorMarkerRef.current = null;
              }

              const marker = L.marker(
                [e.latlng.lat, e.latlng.lng],
                {
                  icon: sensorIcon,
                }
              );
              addSensorMarkerRef.current = marker;
              fakeSensorsLayerRef.current?.addLayer(marker);

              return;
            }

            setCurrentSensor({
              __v: 0,
              _id: "",
              area_id: "",
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
              name: "New Sensor",
              sensor_id: "",
            });
            L.marker(
              [e.latlng.lat, e.latlng.lng],
              {
                icon: sensorIcon,
              }
            ).addTo(leafletMapRef.current);
          });

          requestAnimationFrame(() => {
            leafletMapRef.current.invalidateSize();
          });
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      }
    };

    fetchSensors();
  }, [refreshSensorList, activeOfflineMap, activeMapLoaded]);

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
    if (!mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      leafletMapRef.current?.invalidateSize();
    });

    resizeObserver.observe(mapRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
    <div className="relative h-full w-full overflow-hidden rounded-lg border shadow">
      {/* Floating Icon Button */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-row gap-2 sm:right-4 sm:top-4 sm:gap-4">
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

              // Remove all fake sensors when PIN mode is disabled
              if (!newState) {
                fakeSensorsLayerRef.current?.clearLayers();
              }
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
        <div className="absolute left-3 top-3 z-[1000] max-h-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] overflow-y-auto sm:left-4 sm:top-4">
          <SensorSettings
            addSensorLat={addSensorLat}
            addSensorLng={addSensorLng}
            disableLatLng={true}
            setSensorAddSuccess={setSensorAddSuccess}
          />
          <div className="absolute top-4 right-4 flex flex-row gap-4 z-[1001]">
            <Button
              onClick={() => {
                if (addSensorMarkerRef.current) {
                  leafletMapRef.current?.removeLayer(
                    addSensorMarkerRef.current
                  );

                  addSensorMarkerRef.current = null;
                }
                setClickAddSensor(false);
                setClickMode(false);

                clickModeRef.current = false;
                clickAddSensorRef.current = false;
                setAddSensorLat(0);
                setAddSensorLng(0);
              }}
              className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 border border-gray-300 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Map container */}
      {!activeMapLoaded ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">
            Loading map...
          </p>
        </div>
      ) : !activeOfflineMap ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              No active map available
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Download an offline map to display it here.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={mapRef}
          id="leaflet-map"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
