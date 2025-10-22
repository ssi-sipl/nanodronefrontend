"use client";
import dynamic from "next/dynamic";

// Import MapDisplay only on client-side
const MapDisplay = dynamic(() => import("@/components/map-display"), {
  ssr: false,
});
import { ConfigurationPanel } from "@/components/configuration-panel";
// import MapDisplay from "@/components/map-display";
import { useState } from "react";
import TelemetryDashboard from "@/components/TelemetryDashboard";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

export default function Dashboard() {
  const [currentSensor, setCurrentSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-80 text-white backdrop-blur-sm">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-transparent border-purple-500 mb-6"></div>
          <p className="text-lg font-medium animate-pulse">{loadingStatus}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* <h1 className="text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Map container with responsive height */}
          <div className="lg:col-span-2 bg-gray-50 rounded-lg shadow-sm">
            <div className="h-full ">
              <MapDisplay setCurrentSensor={setCurrentSensor} />
              {/* <div className="w-full">
              <TelemetryDashboard />
            </div> */}
            </div>
          </div>

          {/* Configuration panel with responsive height */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <ConfigurationPanel
              currentSensor={currentSensor}
              setIsLoading={setIsLoading}
              setLoadingStatus={setLoadingStatus}
            />
          </div>
        </div>
      </div>
    </>
  );
}
