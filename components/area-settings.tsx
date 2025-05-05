"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AreaSettings() {

  const [areaId, setAreaId] = useState("")
  const [areaName, setAreaName] = useState("")

  const handleSave = () => {
    // if (areaId && areaName) {
    //   addArea({ id: areaId, name: areaName })
    //   setAreaId("")
    //   setAreaName("")
    //   alert("Area added successfully!")
    // } else {
    //   alert("Please enter both area ID and name")
    // }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="areaId">Area ID</Label>
            <Input
              id="areaId"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              placeholder="Enter area ID"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="areaName">Area Name</Label>
            <Input
              id="areaName"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Enter area name"
            />
          </div>

          <Button onClick={handleSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}
