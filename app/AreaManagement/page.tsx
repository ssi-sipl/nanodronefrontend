"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { baseUrl } from "@/lib/config";

export default function AreaManagement() {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    [key: string]: { name: string; area_id: string };
  }>({});

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${baseUrl}/areas`);
      setAreas(res.data.data);
    } catch (err) {
      console.error("Failed to fetch areas", err);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSubmit = async () => {
    if (!name || !areaId) return alert("Please enter both name and area ID");
    try {
      await axios.post(`${baseUrl}/areas/create`, {
        name,
        area_id: areaId,
      });
      setName("");
      setAreaId("");
      fetchAreas();
    } catch (err) {
      console.error("Error creating area", err);
    }
  };

  const handleEditClick = (area: any) => {
    setEditId(area._id);
    setEditValues({
      ...editValues,
      [area._id]: {
        name: area.name,
        area_id: area.area_id,
      },
    });
  };

  const handleEditChange = (
    id: string,
    field: "name" | "area_id",
    value: string
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleEditSave = async (id: string) => {
    try {
      const { name, area_id } = editValues[id];
      await axios.post(`${baseUrl}/areas/update`, {
        id,
        name,
        area_id,
      });
      setEditId(null);
      fetchAreas();
    } catch (err) {
      console.error("Error updating area", err);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.post(`${baseUrl}/areas/delete/${id}`);
      fetchAreas();
    } catch (err) {
      console.error("Error deleting area", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Area Management
      </h1>

      {/* Add Area Form */}
      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          <div className="text-lg md:text-xl font-semibold text-left mb-4">
            Add Area
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <div className="flex flex-col w-full flex-1 items-start gap-1">
              <Input
                id="name"
                className="w-full h-10"
                value={name}
                placeholder="Enter Area Name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full flex-1 items-start gap-1">
              <Input
                id="areaId"
                className="w-full h-10"
                value={areaId}
                placeholder="Enter Area Id"
                onChange={(e) => setAreaId(e.target.value)}
              />
            </div>

            <div className="w-full flex-1">
              <Button className="w-full" onClick={handleSubmit}>
                Create Area
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Areas Table with Curved Border */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-left mb-4">
          All Areas
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
          <table className="min-w-full text-left border-collapse overflow-hidden rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 md:p-3 border border-gray-300">Name</th>
                <th className="p-2 md:p-3 border border-gray-300">Area ID</th>
                <th className="p-2 md:p-3 border border-gray-300">Drones</th>
                <th className="p-2 md:p-3 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area: any) => (
                <tr key={area._id}>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editId === area._id ? (
                      <Input
                        className="h-9"
                        value={editValues[area._id]?.name || ""}
                        onChange={(e) =>
                          handleEditChange(area._id, "name", e.target.value)
                        }
                      />
                    ) : (
                      area.name
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {editId === area._id ? (
                      <Input
                        className="h-9"
                        value={editValues[area._id]?.area_id || ""}
                        onChange={(e) =>
                          handleEditChange(area._id, "area_id", e.target.value)
                        }
                      />
                    ) : (
                      area.area_id
                    )}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {area.drones ? area.drones.length : 0}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {editId === area._id ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSave(area._id)}
                            className="text-xs md:text-sm"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            className="text-xs md:text-sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(area)}
                            className="p-1 md:p-2"
                          >
                            <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(area._id)}
                            className="p-1 md:p-2"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
