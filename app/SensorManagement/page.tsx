"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/lib/config";
import { AreaDropdown } from "@/components/area-dropdown";
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
      console.log("Creating sensor:", newSensor);
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sensor Management</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          className="border p-2"
          value={newSensor.name}
          onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Sensor ID"
          className="border p-2"
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
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Area" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {areas.length > 0 ? (
              areas.map((area) => (
                <SelectItem key={area.name} value={area.area_id}>
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
          className="border p-2"
          value={newSensor.latitude}
          onChange={(e) =>
            setNewSensor({ ...newSensor, latitude: parseFloat(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Longitude"
          className="border p-2"
          value={newSensor.longitude}
          onChange={(e) =>
            setNewSensor({
              ...newSensor,
              longitude: parseFloat(e.target.value),
            })
          }
        />
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={handleCreate}
        >
          Add
        </button>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Sensor ID</th>
            <th className="border px-4 py-2">Area ID</th>
            <th className="border px-4 py-2">Latitude</th>
            <th className="border px-4 py-2">Longitude</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor) => (
            <tr key={sensor._id}>
              <td className="border px-4 py-2">
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
                    className="border p-1"
                  />
                ) : (
                  sensor.name
                )}
              </td>
              <td className="border px-4 py-2">
                {editingSensor?._id === sensor._id ? (
                  <input
                    type="text"
                    value={editingSensor.sensor_id}
                    onChange={(e) =>
                      setEditingSensor({
                        ...editingSensor,
                        sensor_id: e.target.value,
                      })
                    }
                    className="border p-1"
                  />
                ) : (
                  sensor.sensor_id
                )}
              </td>
              <td className="border px-4 py-2">
                {editingSensor?._id === sensor._id ? (
                  <input
                    type="text"
                    value={editingSensor.area_id}
                    onChange={(e) =>
                      setEditingSensor({
                        ...editingSensor,
                        area_id: e.target.value,
                      })
                    }
                    className="border p-1"
                  />
                ) : (
                  sensor.area_id
                )}
              </td>
              <td className="border px-4 py-2">
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
                    className="border p-1"
                  />
                ) : (
                  sensor.latitude
                )}
              </td>
              <td className="border px-4 py-2">
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
                    className="border p-1"
                  />
                ) : (
                  sensor.longitude
                )}
              </td>
              <td className="border px-4 py-2 flex gap-2">
                {editingSensor?._id === sensor._id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1"
                      onClick={() => setEditingSensor(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1"
                      onClick={() => setEditingSensor(sensor)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1"
                      onClick={() => handleDelete(sensor._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
