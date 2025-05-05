"use client"

import { useState } from "react"
import { useDroneContext } from "./drone-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConfigurationPanel() {
  const { drones, selectedDroneId } = useDroneContext()
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [altitude, setAltitude] = useState("")

  const selectedDrone = drones.find((drone) => drone.id === selectedDroneId)

  const handleSendDrone = () => {
    alert(`Sending ${selectedDrone?.name || "drone"} to coordinates: ${latitude}, ${longitude}, ${altitude}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="altitude">Altitude</Label>
            <Input
              id="altitude"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              placeholder="Enter altitude"
            />
          </div>

          <Button className="w-full" onClick={handleSendDrone} disabled={!selectedDroneId}>
            Send {selectedDrone?.name || "Drone"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
