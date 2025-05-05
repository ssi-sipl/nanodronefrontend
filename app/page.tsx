import { MapDisplay } from "@/components/map-display"
import { ConfigurationPanel } from "@/components/configuration-panel"
import { DroneDropdown } from "@/components/drone-dropdown"

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MapDisplay />
          <DroneDropdown />
        </div>

        <div>
          <ConfigurationPanel />
        </div>
      </div>
    </div>
  )
}
