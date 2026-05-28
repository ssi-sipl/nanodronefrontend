"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { deleteSensor, type Sensor } from "@/lib/api";

type SensorTableProps = {
  sensors: Sensor[];
  loading: boolean;
  onDeleted: () => void;
};

export function SensorTable({ sensors, loading, onDeleted }: SensorTableProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteSensor(id);
      toast.success("Sensor deleted successfully");
      onDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete sensor");
    }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-left">All Sensors</h2>
        <Button asChild className="bg-black text-white hover:bg-gray-800">
          <Link href="/sensors/create">
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </Button>
      </div>

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
            {loading ? (
              <tr>
                <td className="p-3 border border-gray-200 text-center" colSpan={6}>
                  Loading sensors...
                </td>
              </tr>
            ) : sensors.length ? (
              sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="p-2 md:p-3 border border-gray-200">{sensor.name}</td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {sensor.sensor_id}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">{sensor.area_id}</td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {sensor.latitude}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {sensor.longitude}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/sensors/edit/${sensor.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(sensor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 border border-gray-200 text-center" colSpan={6}>
                  No sensors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
