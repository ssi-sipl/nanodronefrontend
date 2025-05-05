"use client"

import { useDroneContext } from "./drone-context"

export function MapDisplay() {
  const { area } = useDroneContext()

  return (
    <div className="bg-gray-200 rounded-lg h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">Map Display</h3>
        {area.latitude && area.longitude ? (
          <p className="mt-2 text-sm text-gray-500">
            Showing area at coordinates: {area.latitude}, {area.longitude}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No area coordinates set. Configure in Settings.</p>
        )}
      </div>
    </div>
  )
}
