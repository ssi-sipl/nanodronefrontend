"use client";
// import dynamic from "next/dynamic";

// Import MapDisplay only on client-side
// const MapDisplay = dynamic(() => import("@/components/map-display"), {
//   ssr: false,
// });

import { ConfigurationPanel } from "@/components/configuration-panel";
import MapDisplay from "@/components/map-display";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-full">
          <MapDisplay setCurrentSensor={setCurrentSensor} />
        </div>

        <div className="h-full">
          <ConfigurationPanel currentSensor={currentSensor} />
        </div>
      </div>
    </div>
  );
}
