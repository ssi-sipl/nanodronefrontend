"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AreaTable } from "@/components/area/AreaTable";
import { getAreas, type Area } from "@/lib/api";

export default function AreasPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAreas = useCallback(async () => {
    try {
      setLoading(true);
      setAreas(await getAreas());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch areas");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setAreas((currentAreas) => currentAreas.filter((area) => area.id !== id));
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  useEffect(() => {
    router.prefetch("/areas/create");
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Area Management
      </h1>
      <AreaTable areas={areas} loading={loading} onDeleted={handleDeleted} />
    </div>
  );
}
