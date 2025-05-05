"use client"

import { useState } from "react"
import { useDroneContext } from "./drone-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DroneSettings() {
  const { addDrone } = useDroneContext()
  const [droneId, setDroneId] = useState("")
  const [droneName, setDroneName] = useState("")

  const handleSave = () => {
    if (droneId && droneName) {
      addDrone({ id: droneId, name: droneName })
      setDroneId("")
      setDroneName("")
      alert("Drone added successfully!")
    } else {
      alert("Please enter both drone ID and name")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="droneId">Drone ID</Label>
            <Input
              id="droneId"
              value={droneId}
              onChange={(e) => setDroneId(e.target.value)}
              placeholder="Enter drone ID"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="droneName">Drone Name</Label>
            <Input
              id="droneName"
              value={droneName}
              onChange={(e) => setDroneName(e.target.value)}
              placeholder="Enter drone name"
            />
          </div>

          <Button onClick={handleSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}
