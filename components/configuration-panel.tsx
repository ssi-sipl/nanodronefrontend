"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";
import { DroneDropdown } from "./drone-dropdown";
import { AreaDropdown } from "./area-dropdown";
import { latLngToMGRS, mgrsToLatLng } from "@/lib/mgrs"; // ✅ import

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface ConfigurationPanelProps {
  currentSensor: Sensor | null;
}

export function ConfigurationPanel({ currentSensor }: ConfigurationPanelProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("10");
  const [areaId, setAreaId] = useState("");
  const [selectedDroneId, setSelectedDroneId] = useState<string | undefined>();
  const [usbAddress, setUsbAddress] = useState("");
  const [gridRef, setGridRef] = useState(""); // ✅ MGRS state

  // Load sensor lat/lng if available
  useEffect(() => {
    if (!currentSensor) return;
    const lat = currentSensor.latitude.toFixed(8);
    const lng = currentSensor.longitude.toFixed(8);
    setLatitude(lat);
    setLongitude(lng);
  }, [currentSensor]);

  // Update MGRS when lat/lng changes
  useEffect(() => {
    if (latitude && longitude) {
      const mgrsStr = latLngToMGRS(parseFloat(latitude), parseFloat(longitude));
      setGridRef(mgrsStr);
    }
  }, [latitude, longitude]);

  // Handle manual MGRS input
  const handleGridRefChange = (value: string) => {
    setGridRef(value.toUpperCase().trim());
    const point = mgrsToLatLng(value);
    if (point) {
      setLatitude(point.lat.toFixed(8));
      setLongitude(point.lng.toFixed(8));
    }
  };

  useEffect(() => {
    const fetchAreaByDroneId = async () => {
      try {
        const res = await fetch(`${baseUrl}/drones/drone/${selectedDroneId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch area");

        setAreaId(data.data.area_id);
      } catch (err) {
        setAreaId("No Area");
      }
    };

    if (selectedDroneId) fetchAreaByDroneId();
  }, [selectedDroneId]);

  const handleSendDrone = async () => {
    try {
      if (
        latitude &&
        longitude &&
        altitude &&
        selectedDroneId &&
        areaId &&
        usbAddress
      ) {
        const res = await fetch(`${baseUrl}/drones/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            altitude: Number(altitude),
            usb_address: usbAddress,
          }),
        });

        const result = await res.json();

        alert(result.message);

        console.log(result);

        setLatitude("");
        setLongitude("");
        setAltitude("10");
        setUsbAddress("");
        setGridRef("");
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
      if (selectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/dropPayload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
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

  const handleDroneView = async () => {
    if (typeof window !== "undefined") {
      const mediaMtxHost = baseUrl.replace(":5000", ":8889");
      const streamUrl = `${mediaMtxHost}/${selectedDroneId}`;
      window.open(streamUrl, "_blank", "width=800,height=600");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy Drone</CardTitle>
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
            <Label htmlFor="gridRef">Grid Reference (MGRS)</Label>
            <Input
              id="gridRef"
              type="text"
              value={gridRef}
              onChange={(e) => handleGridRefChange(e.target.value)}
              placeholder="e.g. 43QED1234567890"
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

          <div className="grid gap-1">
            <Label htmlFor="droneID">Drone ID</Label>
            <DroneDropdown
              selectedDroneId={selectedDroneId ?? null}
              setSelectedDroneId={(id) => setSelectedDroneId(id)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="usb_address">USB Address</Label>
            <Input
              id="usb_address"
              type="text"
              value={usbAddress}
              onChange={(e) => setUsbAddress(e.target.value)}
              placeholder="Enter USB address"
            />
          </div>

          <div className="grid gap-1">
            <Label className="text-gray-500" htmlFor="areaID">
              Area ID (Auto)
            </Label>

            <AreaDropdown
              selectedAreaId={areaId}
              setSelectedAreaId={() => {}}
              disabled={true}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSendDrone}
            disabled={!selectedDroneId}
          >
            Send Drone
          </Button>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 transition-all ease-in-out"
            onClick={handleDropPayload}
            disabled={!selectedDroneId}
          >
            Drop Payload
          </Button>
          <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition-all ease-in-out"
            onClick={handleDroneView}
            disabled={!selectedDroneId}
          >
            Drone View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


