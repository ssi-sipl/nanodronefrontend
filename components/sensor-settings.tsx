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
import { latLngToMGRS, mgrsToLatLng } from "@/lib/mgrs"; // ✅ Import utility

type Area = {
  name: string;
  area_id: string;
};

export function SensorSettings({
  addSensorLat,
  addSensorLng,
  disableLatLng = false,
  setSensorAddSuccess,
}: {
  addSensorLat?: number;
  addSensorLng?: number;
  disableLatLng?: boolean;
  setSensorAddSuccess?: (success: boolean) => void;
}) {
  const [sensorId, setSensorId] = useState("");
  const [sensorName, setSensorName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gridRef, setGridRef] = useState(""); // ✅ MGRS

  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  useEffect(() => {
    if (addSensorLat && addSensorLng) {
      setLatitude(addSensorLat.toString());
      setLongitude(addSensorLng.toString());
    }
  }, [addSensorLat, addSensorLng]);

  // ✅ Update gridRef when lat/lng change
  useEffect(() => {
    if (latitude && longitude) {
      const mgrsStr = latLngToMGRS(parseFloat(latitude), parseFloat(longitude));
      setGridRef(mgrsStr);
    }
  }, [latitude, longitude]);

  // ✅ Handle gridRef edit
  const handleGridRefChange = (value: string) => {
    setGridRef(value.toUpperCase().trim());
    const point = mgrsToLatLng(value);
    if (point) {
      setLatitude(point.lat.toFixed(8));
      setLongitude(point.lng.toFixed(8));
    }
  };

  const handleSave = async () => {
    if (sensorId && sensorName && selectedAreaId && latitude && longitude) {
      const res = await fetch(`${baseUrl}/sensors/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sensorName,
          area_id: selectedAreaId,
          sensor_id: sensorId,
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      });

      const result = await res.json();

      alert(result.message);

      console.log(result);

      setSensorId("");
      setSensorName("");
      setLatitude("");
      setLongitude("");
      setGridRef(""); // ✅ clear grid
      setSelectedAreaId(null);
      if (setSensorAddSuccess) {
        setSensorAddSuccess(true);
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`${baseUrl}/areas`);
        const response = await res.json();
        if (response.status && response.data) {
          setAreas(response.data || []);
          console.log("Areas fetched successfully: ", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };

    fetchAreas();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Sensor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sensorId">Sensor ID</Label>
              <Input
                id="sensorId"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                placeholder="Enter sensor ID"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sensorName">Sensor Name</Label>
              <Input
                id="sensorName"
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                placeholder="Enter sensor name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sensorLatitude">Latitude</Label>
              <Input
                id="latitude"
                disabled={disableLatLng}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter sensor latitude"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sensorLongitude">Longitude</Label>
              <Input
                id="longitude"
                disabled={disableLatLng}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter sensor longitude"
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

            <div className="grid gap-2 z-5000">
              <Select
                value={selectedAreaId || ""}
                onValueChange={(value) => setSelectedAreaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an Area" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  className="z-[1100]"
                >
                  {areas.length > 0 ? (
                    areas.map((sensor) => (
                      <SelectItem key={sensor.area_id} value={sensor.area_id}>
                        {sensor.name}
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

            <Button onClick={handleSave}>Add Sensor</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

