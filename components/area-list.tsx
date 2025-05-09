"use client";

import { useState, useEffect } from "react";
import { AreaCard } from "@/components/area-card";
import { Skeleton } from "@/components/ui/skeleton";
import { baseUrl } from "@/lib/config";
// import { getAllAreas } from "@/lib/actions";

type Area = {
  _id: string;
  name: string;
  area_id: string;
  drones: string[];
};

export function AreaList() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`${baseUrl}/areas`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setAreas(data || []);
            console.log("Areas fetched successfully: ", data);
            return;
          }
        }
        // alert(response.message);
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };

    fetchAreas();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/areas/delete/${id}`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.status) {
        alert(result.message);
        setAreas(areas.filter((area) => area._id !== id));
      } else {
        alert(result.message);
        console.log(result);
      }
    } catch (error) {
      console.error("Failed to delete area:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <div className="flex justify-end gap-2 mt-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <h3 className="text-xl font-medium text-gray-500">No areas found</h3>
        <p className="text-gray-400 mt-2">
          Create your first area to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {areas.map((area) => (
        <AreaCard key={area._id} area={area} onDelete={handleDelete} />
      ))}
    </div>
  );
}
