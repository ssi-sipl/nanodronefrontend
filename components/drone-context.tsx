"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Drone = {
  id: string
  name: string
}

type Area = {
  latitude: string
  longitude: string
}

type DroneContextType = {
  drones: Drone[]
  selectedDroneId: string | null
  area: Area
  addDrone: (drone: Drone) => void
  setSelectedDroneId: (id: string | null) => void
  updateArea: (area: Area) => void
}

const DroneContext = createContext<DroneContextType | undefined>(undefined)

export function DroneProvider({ children }: { children: ReactNode }) {
  const [drones, setDrones] = useState<Drone[]>([])
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)
  const [area, setArea] = useState<Area>({ latitude: "", longitude: "" })

  const addDrone = (drone: Drone) => {
    setDrones((prev) => [...prev, drone])
  }

  const updateArea = (newArea: Area) => {
    setArea(newArea)
  }

  return (
    <DroneContext.Provider
      value={{
        drones,
        selectedDroneId,
        area,
        addDrone,
        setSelectedDroneId,
        updateArea,
      }}
    >
      {children}
    </DroneContext.Provider>
  )
}

export function useDroneContext() {
  const context = useContext(DroneContext)
  if (context === undefined) {
    throw new Error("useDroneContext must be used within a DroneProvider")
  }
  return context
}
