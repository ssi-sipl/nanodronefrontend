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

interface Drone {
  _id: string;
  name: string;
  drone_id: string;
  area_id: string;
  area: string;
}

type Area = {
  name: string;
  area_id: string;
};

export default function DroneManagement() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [newDrone, setNewDrone] = useState({
    name: "",
    drone_id: "",
    area: "",
  });
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetchDrones();
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

  const fetchDrones = async () => {
    try {
      const res = await axios.get(`${baseUrl}/drones/`);
      setDrones(res.data.data);
    } catch (err) {
      console.error("Failed to fetch drones", err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${baseUrl}/drones/create`, {
        name: newDrone.name,
        drone_id: newDrone.drone_id,
        area_id: newDrone.area,
      });
      setNewDrone({ name: "", drone_id: "", area: "" });
      fetchDrones();
    } catch (err) {
      console.error("Failed to create drone", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingDrone) return;
    console.log("Updating drone:", typeof editingDrone._id);
    console.log("Editing drone:", editingDrone);
    try {
      await axios.post(`${baseUrl}/drones/update/${editingDrone._id}`, {
        name: editingDrone.name,
        drone_id: editingDrone.drone_id,
        area_id: editingDrone.area_id,
      });
      setEditingDrone(null);
      fetchDrones();
    } catch (err) {
      console.error("Failed to update drone", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${baseUrl}/drones/delete/${id}`);
      fetchDrones();
    } catch (err) {
      console.error("Failed to delete drone", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Drone Management</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          className="border p-2"
          value={newDrone.name}
          onChange={(e) => setNewDrone({ ...newDrone, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Drone ID"
          className="border p-2"
          value={newDrone.drone_id}
          onChange={(e) =>
            setNewDrone({ ...newDrone, drone_id: e.target.value })
          }
        />
        {/* <input
          type="text"
          placeholder="Area ID"
          className="border p-2"
          value={newDrone.area}
          onChange={(e) => setNewDrone({ ...newDrone, area: e.target.value })}
        /> */}

        <Select
          value={newDrone.area || ""}
          onValueChange={(value) => setNewDrone({ ...newDrone, area: value })}
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
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={handleCreate}
        >
          Add
        </button>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Drone ID</th>
            <th className="border px-4 py-2">Area</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {drones.map((drone) => (
            <tr key={drone._id}>
              <td className="border px-4 py-2">
                {editingDrone?._id === drone._id ? (
                  <input
                    type="text"
                    value={editingDrone.name}
                    onChange={(e) =>
                      setEditingDrone({ ...editingDrone, name: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  drone.name
                )}
              </td>
              <td className="border px-4 py-2">
                {editingDrone?._id === drone._id ? (
                  <input
                    type="text"
                    value={editingDrone.drone_id}
                    disabled={true}
                    onChange={(e) =>
                      setEditingDrone({
                        ...editingDrone,
                        drone_id: e.target.value,
                      })
                    }
                    className="border p-1"
                  />
                ) : (
                  drone.drone_id
                )}
              </td>
              <td className="border px-4 py-2">
                {editingDrone?._id === drone._id ? (
                  <input
                    type="text"
                    value={editingDrone.area_id}
                    disabled={true}
                    onChange={(e) =>
                      setEditingDrone({ ...editingDrone, area: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  drone.area_id
                )}
              </td>

              <td className="border px-4 py-2 flex gap-2">
                {editingDrone?._id === drone._id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1"
                      onClick={handleUpdate}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1"
                      onClick={() => setEditingDrone(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1"
                      onClick={() => setEditingDrone(drone)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1"
                      onClick={() => handleDelete(drone._id)}
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
