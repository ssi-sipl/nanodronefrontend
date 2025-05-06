"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await fetch(`${baseUrl}/drones`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setDrones(data || []);
            console.log("Drones fetched successfully:", data);
            return;
          }
        }
        alert(response.message);
      } catch (error) {
        console.error("Failed to fetch drones:", error);
      }
    };

    fetchDrones();
  }, []);

  return (
    <div className="mt-4">
      <Select
        value={selectedDroneId || ""}
        onValueChange={(value) => setSelectedDroneId(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a drone" />
        </SelectTrigger>
        <SelectContent>
          {drones.length > 0 ? (
            drones.map((drone) => (
              <SelectItem key={drone.name} value={drone.drone_id}>
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
