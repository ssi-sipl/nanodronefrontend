"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseUrl } from "@/lib/config.js";

type Drone = {
  name: string;
  drone_id: string;
};

export function DroneDropdown({
  selectedDroneId,
  setSelectedDroneId,
}: {
  selectedDroneId: string | null;
  setSelectedDroneId: (id: string) => void;
}) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/drones`, { cache: "no-store" });
      const response = await res.json();
      if (response.status) {
        if (response.data) {
          setDrones(response.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch drones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);

  return (
    <div className="mt-4">
      <Select
        value={selectedDroneId || ""}
        onValueChange={(value) => setSelectedDroneId(value)}
        onOpenChange={(open) => {
          // Refetch every time the dropdown is opened, so newly
          // created drones show up without needing a hard page reload.
          if (open) fetchDrones();
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading drones..." : "Select a drone"} />
        </SelectTrigger>
        <SelectContent>
          {drones.length > 0 ? (
            drones.map((drone) => (
              <SelectItem key={drone.drone_id} value={drone.drone_id}>
                {drone.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No drones available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}