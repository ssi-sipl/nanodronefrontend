"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AreaTable } from "@/components/area/AreaTable";
import { getAreas, type Area } from "@/lib/api";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAreas = async () => {
    try {
      setLoading(true);
      setAreas(await getAreas());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Area Management
      </h1>
      <AreaTable areas={areas} loading={loading} onDeleted={loadAreas} />
    </div>
  );
}
