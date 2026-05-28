"use client";

import { useEffect, useState } from "react";
import { DroneTable } from "@/components/drone/DroneTable";
import { getDrones, type Drone } from "@/lib/api";
import toast from "react-hot-toast";

export default function DronesPage() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrones = async () => {
    try {
      setLoading(true);
      setDrones(await getDrones());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch drones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrones();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Drone Management
      </h1>
      <DroneTable drones={drones} loading={loading} onDeleted={loadDrones} />
    </div>
  );
}
