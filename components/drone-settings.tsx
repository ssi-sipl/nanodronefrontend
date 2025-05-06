"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";

export function DroneSettings() {
  const [droneId, setDroneId] = useState("");
  const [droneName, setDroneName] = useState("");

  const handleSave = async () => {
    if (droneId && droneName) {
      const res = await fetch(`${baseUrl}/drones/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: droneName, drone_id: droneId }),
      });

      const result = await res.json();

      alert(result.message);

      console.log(result);

      setDroneId("");
      setDroneName("");
    } else {
      alert("Please fill in all fields");
    }
  };

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
  );
}
