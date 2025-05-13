"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Sensor {
  _id: string;
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
        setAreas(response.data);
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
      await axios.post(`${baseUrl}/sensors/create`, newSensor);
      setNewSensor({
        name: "",
        sensor_id: "",
        area_id: "",
        latitude: 0,
        longitude: 0,
      });
      fetchSensors();
    } catch (err) {
      console.error("Failed to create sensor", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingSensor) return;
    try {
      await axios.post(
        `${baseUrl}/sensors/update/${editingSensor._id}`,
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
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Sensor Management
      </h1>

      <Card className="mb-6 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Name"
              className="border p-2 rounded w-40"
              value={newSensor.name}
              onChange={(e) =>
                setNewSensor({ ...newSensor, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Sensor ID"
              className="border p-2 rounded w-40"
              value={newSensor.sensor_id}
              onChange={(e) =>
                setNewSensor({ ...newSensor, sensor_id: e.target.value })
              }
            />
            <Select
              value={newSensor.area_id || ""}
              onValueChange={(value) =>
                setNewSensor({ ...newSensor, area_id: value })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent className="z-50">
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
            <input
              type="number"
              placeholder="Latitude"
              className="border p-2 rounded w-32"
              value={newSensor.latitude}
              onChange={(e) =>
                setNewSensor({
                  ...newSensor,
                  latitude: parseFloat(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Longitude"
              className="border p-2 rounded w-32"
              value={newSensor.longitude}
              onChange={(e) =>
                setNewSensor({
                  ...newSensor,
                  longitude: parseFloat(e.target.value),
                })
              }
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleCreate}
            >
              Add
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-center mb-4">
            All Sensors
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Sensor ID</th>
                  <th className="border px-3 py-2">Area ID</th>
                  <th className="border px-3 py-2">Latitude</th>
                  <th className="border px-3 py-2">Longitude</th>
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((sensor) => (
                  <tr key={sensor._id}>
                    <td className="border px-3 py-2">
                      {editingSensor?._id === sensor._id ? (
                        <input
                          type="text"
                          value={editingSensor.name}
                          onChange={(e) =>
                            setEditingSensor({
                              ...editingSensor,
                              name: e.target.value,
                            })
                          }
                          className="border p-1 rounded"
                        />
                      ) : (
                        sensor.name
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {editingSensor?._id === sensor._id ? (
                        <input
                          type="text"
                          disabled
                          value={editingSensor.sensor_id}
                          className="border p-1 rounded"
                        />
                      ) : (
                        sensor.sensor_id
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {editingSensor?._id === sensor._id ? (
                        <input
                          type="text"
                          disabled
                          value={editingSensor.area_id}
                          className="border p-1 rounded"
                        />
                      ) : (
                        sensor.area_id
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {editingSensor?._id === sensor._id ? (
                        <input
                          type="number"
                          value={editingSensor.latitude}
                          onChange={(e) =>
                            setEditingSensor({
                              ...editingSensor,
                              latitude: parseFloat(e.target.value),
                            })
                          }
                          className="border p-1 rounded"
                        />
                      ) : (
                        sensor.latitude
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {editingSensor?._id === sensor._id ? (
                        <input
                          type="number"
                          value={editingSensor.longitude}
                          onChange={(e) =>
                            setEditingSensor({
                              ...editingSensor,
                              longitude: parseFloat(e.target.value),
                            })
                          }
                          className="border p-1 rounded"
                        />
                      ) : (
                        sensor.longitude
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <div className="flex gap-2">
                        {editingSensor?._id === sensor._id ? (
                          <>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded"
                              onClick={handleUpdate}
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-500 text-white px-2 py-1 rounded"
                              onClick={() => setEditingSensor(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-yellow-500 text-white px-2 py-1 rounded"
                              onClick={() => setEditingSensor(sensor)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded"
                              onClick={() => handleDelete(sensor._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
