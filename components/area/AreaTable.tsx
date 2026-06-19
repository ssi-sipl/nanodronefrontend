"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { deleteArea, type Area } from "@/lib/api";

type AreaTableProps = {
  areas: Area[];
  loading: boolean;
  onDeleted: (id: string) => void;
};

export const AreaTable = memo(function AreaTable({
  areas,
  loading,
  onDeleted,
}: AreaTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    try {
      setDeletingId(id);
      await deleteArea(id);
      toast.success("Area deleted successfully");
      onDeleted(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete area");
    } finally {
      setDeletingId(null);
    }
  }, [onDeleted]);

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-left">All Areas</h2>
        <Button asChild className="bg-black text-white hover:bg-gray-800">
          <Link href="/areas/create">
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
              <th className="p-2 md:p-3 border border-gray-300">Area ID</th>
              <th className="p-2 md:p-3 border border-gray-300">Drones</th>
              <th className="p-2 md:p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 border border-gray-200 text-center" colSpan={4}>
                  Loading areas...
                </td>
              </tr>
            ) : areas.length ? (
              areas.map((area) => (
                <tr key={area.id}>
                  <td className="p-2 md:p-3 border border-gray-200">{area.name}</td>
                  <td className="p-2 md:p-3 border border-gray-200">{area.area_id}</td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    {area.drones ? area.drones.length : 0}
                  </td>
                  <td className="p-2 md:p-3 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/areas/edit/${area.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === area.id}
                        onClick={() => handleDelete(area.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 border border-gray-200 text-center" colSpan={4}>
                  No areas found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
