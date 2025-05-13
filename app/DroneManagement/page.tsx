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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

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
      if (response.status && response.data) {
        setAreas(response.data || []);
      }
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Drone Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Name"
              value={newDrone.name}
              onChange={(e) => setNewDrone({ ...newDrone, name: e.target.value })}
              className="h-9 text-sm"
            />
            <Input
              placeholder="Drone ID"
              value={newDrone.drone_id}
              onChange={(e) => setNewDrone({ ...newDrone, drone_id: e.target.value })}
              className="h-9 text-sm"
            />
            <Select
              value={newDrone.area}
              onValueChange={(value) => setNewDrone({ ...newDrone, area: value })}
            >
              <SelectTrigger className="h-9 text-sm">
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
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-black text-white text-xs px-4 py-1 mt-2 hover:bg-gray-800 h-8"
              onClick={handleCreate}
            >
              Add Drone
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">All Drones</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-2 border-r">Name</th>
                <th className="p-2 border-r">Drone ID</th>
                <th className="p-2 border-r">Area</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drones.map((drone) => (
                <tr key={drone._id} className="border-t text-sm">
                  <td className="p-2 border-r">
                    {editingDrone?._id === drone._id ? (
                      <Input
                        value={editingDrone.name}
                        onChange={(e) =>
                          setEditingDrone({ ...editingDrone, name: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      drone.name
                    )}
                  </td>
                  <td className="p-2 border-r">
                    {editingDrone?._id === drone._id ? (
                      <Input
                        value={editingDrone.drone_id}
                        disabled
                        className="h-8 text-sm"
                      />
                    ) : (
                      drone.drone_id
                    )}
                  </td>
                  <td className="p-2 border-r">
                    {editingDrone?._id === drone._id ? (
                      <Input
                        value={editingDrone.area_id}
                        disabled
                        className="h-8 text-sm"
                      />
                    ) : (
                      drone.area_id
                    )}
                  </td>
                  <td className="p-2 space-x-2">
                    {editingDrone?._id === drone._id ? (
                      <>
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={handleUpdate}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setEditingDrone(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDrone(drone)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(drone._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
