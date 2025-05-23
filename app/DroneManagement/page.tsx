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

interface Drone {
  id: string;
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
      const res = await axios.post(`${baseUrl}/drones/create`, {
        name: newDrone.name,
        drone_id: newDrone.drone_id,
        area_id: newDrone.area,
      });
      alert(res.data.message);
      setNewDrone({ name: "", drone_id: "", area: "" });
      fetchDrones();
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
    if (!editingDrone) return;
    try {
      await axios.post(`${baseUrl}/drones/update/${editingDrone.id}`, {
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Drone Management
      </h1>

      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          <div className="text-lg md:text-xl font-semibold text-left mb-4">
            Add Drone
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6">
            {/* <div className="flex flex-col md:flex-row w-full md:w-3/4 items-start gap-3"> */}
            <Input
              placeholder="Enter Drone Name"
              value={newDrone.name}
              onChange={(e) =>
                setNewDrone({ ...newDrone, name: e.target.value })
              }
              className="h-10 w-full "
            />
            <Input
              placeholder="Enter Drone ID"
              value={newDrone.drone_id}
              onChange={(e) =>
                setNewDrone({ ...newDrone, drone_id: e.target.value })
              }
              className="h-10 w-full "
            />
            <Select
              value={newDrone.area}
              onValueChange={(value) =>
                setNewDrone({ ...newDrone, area: value })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select Drone Area" />
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
            <Button
              className="bg-black text-white hover:bg-gray-800 h-10 w-full md:w-auto"
              onClick={handleCreate}
            >
              Add Drone
            </Button>
            {/* </div> */}

            {/* <div className="w-full md:w-1/4 flex items-end justify-start md:justify-end h-full">
              <Button
                className="bg-black text-white hover:bg-gray-800 h-10 w-full md:w-auto"
                onClick={handleCreate}
              >
                Add Drone
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-left mb-4">
          All Drones
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
          <table className="min-w-full text-left border-collapse overflow-hidden rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 md:p-3 border border-gray-300">Name</th>
                <th className="p-2 md:p-3 border border-gray-300">Drone ID</th>
                <th className="p-2 md:p-3 border border-gray-300">Area</th>
                <th className="p-2 md:p-3 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drones.map((drone) => (
                <tr key={drone.id}>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingDrone?.id === drone.id ? (
                      <Input
                        value={editingDrone?.name}
                        onChange={(e) =>
                          setEditingDrone({
                            ...editingDrone,
                            name: e.target.value,
                          })
                        }
                        className="h-9"
                      />
                    ) : (
                      drone.name
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingDrone?.id === drone.id ? (
                      <Input
                        value={editingDrone.drone_id}
                        disabled
                        className="h-9"
                      />
                    ) : (
                      drone.drone_id
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editingDrone?.id === drone.id ? (
                      <Input
                        value={editingDrone.area_id}
                        disabled
                        className="h-9"
                      />
                    ) : (
                      drone.area_id
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200 space-x-2">
                    <div className="flex flex-wrap gap-2">
                      {editingDrone?.id === drone.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdate}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
                            onClick={() => handleDelete(drone.id)}
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
