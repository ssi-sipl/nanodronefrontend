"use client";

import dynamic from "next/dynamic";

// Import MapDisplay only on client-side
const MapDisplay = dynamic(() => import("@/components/map-display"), {
  ssr: false,
});

// import { MapDisplay } from "@/components/map-display";
import { ConfigurationPanel } from "@/components/configuration-panel";
import { DroneDropdown } from "@/components/drone-dropdown";
import { AreaDropdown } from "@/components/area-dropdown";
import { useState } from "react";

export default function Dashboard() {
  const [selectedDroneId, setSelectedDroneId] = useState<string | undefined>();
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MapDisplay />
          <DroneDropdown
            selectedDroneId={selectedDroneId ?? null}
            setSelectedDroneId={(id) => setSelectedDroneId(id)}
          />
          <AreaDropdown
            selectedAreaId={selectedAreaId || null}
            setSelectedAreaId={(value) => setSelectedAreaId(value)}
          />
        </div>

        <div>
          <ConfigurationPanel
            selectedDroneId={selectedDroneId ?? ""}
            selectedAreaId={selectedAreaId ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
