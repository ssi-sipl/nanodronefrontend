"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil } from "lucide-react";
import { baseUrl } from "@/lib/config";

export default function AreaManagement() {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

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
      if (editId) {
        await axios.post(`${baseUrl}/areas/update`, {
          id: editId,
          name,
          area_id: areaId,
        });
        setEditId(null);
      } else {
        await axios.post(`${baseUrl}/areas/create`, {
          name,
          area_id: areaId,
        });
      }
      setName("");
      setAreaId("");
      fetchAreas();
    } catch (err) {
      console.error("Error submitting area", err);
    }
  };

  const handleEdit = (area: any) => {
    setName(area.name);
    setAreaId(area.area_id);
    setEditId(area._id);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting area with ID:", typeof id);
      await axios.post(`${baseUrl}/areas/delete/${id}`);
      fetchAreas();
    } catch (err) {
      console.error("Error deleting area", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Area Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="areaId">Area ID</Label>
              <Input
                id="areaId"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>
            {editId ? "Update" : "Create"} Area
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Area ID</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area: any) => (
                <tr key={area._id} className="border-t">
                  <td className="p-2">{area.name}</td>
                  <td className="p-2">{area.area_id}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(area)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(area._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
