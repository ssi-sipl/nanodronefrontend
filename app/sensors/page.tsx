"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SensorTable } from "@/components/sensor/SensorTable";
import { getSensors, type Sensor } from "@/lib/api";

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSensors = async () => {
    try {
      setLoading(true);
      setSensors(await getSensors());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch sensors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-center">
        Sensor Management
      </h1>
      <SensorTable sensors={sensors} loading={loading} onDeleted={loadSensors} />
    </div>
  );
}
