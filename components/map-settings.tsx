"use client"

import { useState } from "react"
import { useDroneContext } from "./drone-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MapSettings() {
  const { updateArea } = useDroneContext()
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const handleSave = () => {
    if (latitude && longitude) {
      updateArea({ latitude, longitude })
      alert("Area coordinates saved successfully!")
    } else {
      alert("Please enter both latitude and longitude")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="areaLatitude">Latitude</Label>
            <Input
              id="areaLatitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="areaLongitude">Longitude</Label>
            <Input
              id="areaLongitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude"
            />
          </div>

          <Button onClick={handleSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}
