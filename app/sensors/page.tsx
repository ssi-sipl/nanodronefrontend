"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SensorTable } from "@/components/sensor/SensorTable";
import { getSensors, type Sensor } from "@/lib/api";

export default function SensorsPage() {
  const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSensors = useCallback(async () => {
    try {
      setLoading(true);
      setSensors(await getSensors());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch sensors");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setSensors((currentSensors) =>
      currentSensors.filter((sensor) => sensor.id !== id)
    );
  }, []);

  useEffect(() => {
    loadSensors();
  }, [loadSensors]);

  useEffect(() => {
    router.prefetch("/sensors/create");
  }, [router]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Sensor Management
      </h1>
      <SensorTable sensors={sensors} loading={loading} onDeleted={handleDeleted} />
    </div>
  );
}
