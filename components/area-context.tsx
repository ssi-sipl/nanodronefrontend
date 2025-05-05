"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Area = {
  id: string
  name: string
}

type AreaContextType = {
  areas: Area[]
  selectedAreaId: string | null
  area: Area
  addArea: (area: Area) => void
  setSelectedAreaId: (id: string | null) => void
  updateArea: (area: Area) => void
}

const AreaContext = createContext<AreaContextType | undefined>(undefined)

export function AreaProvider({ children }: { children: ReactNode }) {
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  const addArea = (area: Area) => {
    setAreas((prev) => [...prev, area])
  }

  

  return (
    <AreaContext.Provider
      value={{
        areas,
        selectedAreaId,
        area,
        addArea,
        setSelectedAreaId,
        updateArea,
      }}
    >
      {children}
    </AreaContext.Provider>
  )
}

export function useAreaContext() {
  const context = useContext(AreaContext)
  if (context === undefined) {
    throw new Error("useAreaContext must be used within a AreaProvider")
  }
  return context
}
