'use client";'
import dynamic from "next/dynamic";

// Import MapDisplay only on client-side
// const MapDisplay = dynamic(() => import("@/components/map-display"), {
//   ssr: false,
// });

import { ConfigurationPanel } from "@/components/configuration-panel";
import MapDisplay from "@/components/map-display";

export default function Dashboard() {
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-full">
          <MapDisplay />
        </div>

        <div className="h-full">
          <ConfigurationPanel />
        </div>
      </div>
    </div>
  );
}
