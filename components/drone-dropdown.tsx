"use client"

import { useDroneContext } from "./drone-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DroneDropdown() {
  const { drones, selectedDroneId, setSelectedDroneId } = useDroneContext()

  return (
    <div className="mt-4">
      <Select value={selectedDroneId || ""} onValueChange={(value) => setSelectedDroneId(value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a drone" />
        </SelectTrigger>
        <SelectContent>
          {drones.length > 0 ? (
            drones.map((drone) => (
              <SelectItem key={drone.id} value={drone.id}>
                {drone.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No drones available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
