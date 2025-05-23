"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

interface Sensor {
  id: string;
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
}

type Area = {
  name: string;
  area_id: string;
};

export default function SensorManagement() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [newSensor, setNewSensor] = useState({
    name: "",
    sensor_id: "",
    area_id: "",
    latitude: 0,
    longitude: 0,
  });
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetchSensors();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${baseUrl}/areas`);
      const response = await res.json();
      if (response.status && response.data) {
        setAreas(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };

  const fetchSensors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/sensors`);
      setSensors(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sensors", err);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await axios.post(`${baseUrl}/sensors/create`, newSensor);
      alert(res.data.message);
      setNewSensor({
        name: "",
        sensor_id: "",
        area_id: "",
        latitude: 0,
        longitude: 0,
      });
      fetchSensors();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingSensor) return;
    try {
      await axios.post(
        `${baseUrl}/sensors/update/${editingSensor.id}`,
        editingSensor
      );
      setEditingSensor(null);
      fetchSensors();
    } catch (err) {
      console.error("Failed to update sensor", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${baseUrl}/sensors/delete/${id}`);
      fetchSensors();
    } catch (err) {
      console.error("Failed to delete sensor", err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Sensor Management
      </h1>

      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          <div className="text-lg md:text-xl font-semibold text-left mb-4">
            Add Sensor
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
            <Input
              placeholder="Sensor Name"
              value={newSensor.name}
              onChange={(e) =>
                setNewSensor({ ...newSensor, name: e.target.value })
              }
              className="h-10 w-full"
            />
            <Input
              placeholder="Sensor ID"
              value={newSensor.sensor_id}
              onChange={(e) =>
                setNewSensor({ ...newSensor, sensor_id: e.target.value })
              }
              className="h-10 w-full"
            />
            <Select
              value={newSensor.area_id}
              onValueChange={(value) =>
                setNewSensor({ ...newSensor, area_id: value })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areas.length > 0 ? (
                  areas.map((area) => (
                    <SelectItem key={area.area_id} value={area.area_id}>
                      {area.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No areas available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Latitude"
              value={newSensor.latitude == 0 ? "" : newSensor.latitude}
              onChange={(e) =>
                setNewSensor({
                  ...newSensor,
                  latitude: Number.parseFloat(e.target.value),
                })
              }
              className="h-10 w-full"
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={newSensor.longitude == 0 ? "" : newSensor.longitude}
              onChange={(e) =>
                setNewSensor({
                  ...newSensor,
                  longitude: Number.parseFloat(e.target.value),
                })
              }
              className="h-10 w-full"
            />
            <Button
              className="bg-black text-white hover:bg-gray-800 h-10 w-full md:w-auto"
              onClick={handleCreate}
            >
              Add Sensor
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-left mb-4">
          All Sensors
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
          <table className="min-w-full text-left border-collapse overflow-hidden rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 md:p-3 border border-gray-300">Name</th>
                <th className="p-2 md:p-3 border border-gray-300">Sensor ID</th>
                <th className="p-2 md:p-3 border border-gray-300">Area ID</th>
                <th className="p-2 md:p-3 border border-gray-300">Latitude</th>
                <th className="p-2 md:p-3 border border-gray-300">Longitude</th>
                <th className="p-2 md:p-3 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingSensor?.id === sensor.id ? (
                      <Input
                        value={editingSensor.name}
                        onChange={(e) =>
                          setEditingSensor({
                            ...editingSensor,
                            name: e.target.value,
                          })
                        }
                        className="h-9"
                      />
                    ) : (
                      sensor.name
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingSensor?.id === sensor.id ? (
                      <Input
                        value={editingSensor.sensor_id}
                        disabled
                        className="h-9"
                      />
                    ) : (
                      sensor.sensor_id
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingSensor?.id === sensor.id ? (
                      <Input
                        value={editingSensor.area_id}
                        disabled
                        className="h-9"
                      />
                    ) : (
                      sensor.area_id
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingSensor?.id === sensor.id ? (
                      <Input
                        type="number"
                        value={editingSensor.latitude}
                        onChange={(e) =>
                          setEditingSensor({
                            ...editingSensor,
                            latitude: Number.parseFloat(e.target.value),
                          })
                        }
                        className="h-9"
                      />
                    ) : (
                      sensor.latitude
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingSensor?.id === sensor.id ? (
                      <Input
                        type="number"
                        value={editingSensor.longitude}
                        onChange={(e) =>
                          setEditingSensor({
                            ...editingSensor,
                            longitude: Number.parseFloat(e.target.value),
                          })
                        }
                        className="h-9"
                      />
                    ) : (
                      sensor.longitude
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {editingSensor?.id === sensor.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdate}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSensor(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSensor(sensor)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(sensor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
