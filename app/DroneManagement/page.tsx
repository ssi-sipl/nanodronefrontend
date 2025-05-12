"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Drone {
  _id: string;
  name: string;
  drone_id: string;
  area: string;
}

export default function DroneManagement() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [newDrone, setNewDrone] = useState({ name: "", drone_id: "", area: "" });
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/drone");
      setDrones(res.data.data);
    } catch (err) {
      console.error("Failed to fetch drones", err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post("http://localhost:5000/api/drone/create", {
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
    try {
      await axios.put(`/api/drone/${editingDrone._id}`, {
        name: editingDrone.name,
        drone_id: editingDrone.drone_id,
        area_id: editingDrone.area,
      });
      setEditingDrone(null);
      fetchDrones();
    } catch (err) {
      console.error("Failed to update drone", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/drone/${id}`);
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
          onChange={(e) => setNewDrone({ ...newDrone, drone_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Area ID"
          className="border p-2"
          value={newDrone.area}
          onChange={(e) => setNewDrone({ ...newDrone, area: e.target.value })}
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={handleCreate}>
          Add
        </button>
      </div>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
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
                    onChange={(e) =>
                      setEditingDrone({ ...editingDrone, drone_id: e.target.value })
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
                    value={editingDrone.area}
                    onChange={(e) =>
                      setEditingDrone({ ...editingDrone, area: e.target.value })
                    }
                    className="border p-1"
                  />
                ) : (
                  drone.area
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
