"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";

interface ConfigurationPanelProps {
  selectedDroneId: string;
}

export function ConfigurationPanel({
  selectedDroneId: propSelectedDroneId,
}: ConfigurationPanelProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("");
  const [areaId, setAreaId] = useState("");

  useEffect(() => {
    const fetchAreaByDroneId = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/drones/drone/${propSelectedDroneId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch area");

        setAreaId(data.data.area_id);
      } catch (err) {
        // alert("Failed to fetch area by drone ID");
        setAreaId("No Area");
      } finally {
        // setLoading(false);
      }
    };

    fetchAreaByDroneId();
  }, [propSelectedDroneId]);

  const handleSendDrone = async () => {
    try {
      if (latitude && longitude && altitude && propSelectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: propSelectedDroneId,
            area_id: areaId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            altitude: Number(altitude),
          }),
        });

        const result = await res.json();

        alert(result.message);

        console.log(result);

        setLatitude("");
        setLongitude("");
        setAltitude("");
      } else {
        alert("Please fill in all fields");
      }
    } catch (error) {
      console.error("Error sending drone:", error);
      alert("Failed to send drone. Please try again.");
    }
  };

  const handleDropPayload = async () => {
    try {
      if (propSelectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/dropPayload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: propSelectedDroneId,
            area_id: areaId,
          }),
        });

        const result = await res.json();

        alert(result.message);

        console.log(result);
      }
    } catch (error) {
      console.error("Error dropping payload:", error);
      alert("Failed to drop payload. Please try again.");
    }
  };

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
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="altitude">Altitude</Label>
            <Input
              id="altitude"
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              placeholder="Enter altitude"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSendDrone}
            disabled={!propSelectedDroneId}
          >
            Send Drone{" "}
            <h1 className="text-red-500">
              {">>"} {propSelectedDroneId}
            </h1>
          </Button>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 transition-all ease-in-out"
            onClick={handleDropPayload}
            disabled={!propSelectedDroneId}
          >
            Drop Payload{" "}
            <h1 className="text-red-500">
              {">>"} {propSelectedDroneId} {">>"} {areaId}
            </h1>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
