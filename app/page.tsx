"use client";
import dynamic from "next/dynamic";

const MapDisplay = dynamic(() => import("@/components/map-display"), { ssr: false });

import { useState } from "react";

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

      <div className="w-full h-[calc(100vh-4rem)]">
        <MapDisplay
          setCurrentSensor={setCurrentSensor}
          currentSensor={currentSensor}
          setIsLoading={setIsLoading}
          setLoadingStatus={setLoadingStatus}
        />
      </div>
    </>
  );
}