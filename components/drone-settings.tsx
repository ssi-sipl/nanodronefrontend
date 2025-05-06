"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Area = {
  name: string;
  area_id: string;
};

export function DroneSettings() {
  const [droneId, setDroneId] = useState("");
  const [droneName, setDroneName] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const handleSave = async () => {
    if (droneId && droneName && selectedAreaId) {
      const res = await fetch(`${baseUrl}/drones/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: droneName,
          drone_id: droneId,
          area_id: selectedAreaId,
        }),
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

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`${baseUrl}/areas`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setAreas(data || []);
            console.log("Areas fetched successfully:", data);
            return;
          }
        }
        // alert(response.message);
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };

    fetchAreas();
  }, []);

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

          <div className="grid gap-2 ">
            <Select
              value={selectedAreaId || ""}
              onValueChange={(value) => setSelectedAreaId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Area" />
              </SelectTrigger>
              <SelectContent>
                {areas.length > 0 ? (
                  areas.map((drone) => (
                    <SelectItem key={drone.name} value={drone.area_id}>
                      {drone.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No areas available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave}>Add Drone</Button>
        </div>
      </CardContent>
    </Card>
  );
}
