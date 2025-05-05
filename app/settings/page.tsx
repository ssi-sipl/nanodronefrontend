import { AreaSettings } from "@/components/area-settings"
import { DroneSettings } from "@/components/drone-settings"
import { MapSettings } from "@/components/map-settings"

export default function Settings() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DroneSettings />
        <MapSettings />
        <AreaSettings />
      </div>
    </div>
  )
}
