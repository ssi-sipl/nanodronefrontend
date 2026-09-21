"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { baseUrl } from "@/lib/config";
import { ChevronDown } from "lucide-react";

type Drone = {
  name: string;
  drone_id: string;
};

interface DroneDropdownProps {
  selectedDroneId: string | null;
  setSelectedDroneId: (id: string) => void;
  variant?: "default" | "compact"; // compact = name as plain text + small chevron-only pill
}

export function DroneDropdown({
  selectedDroneId,
  setSelectedDroneId,
  variant = "default",
}: DroneDropdownProps) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/drones`, { cache: "no-store" });
      const response = await res.json();
      if (response.status && response.data) {
        setDrones(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch drones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);

  const selectedDrone = drones.find((d) => d.drone_id === selectedDroneId);

  const select = (
    <Select
      value={selectedDroneId || ""}
      onValueChange={(value) => setSelectedDroneId(value)}
      onOpenChange={(open) => {
        if (open) fetchDrones();
      }}
    >
      <SelectTrigger
        className={
          variant === "compact"
            ? "h-7 w-auto px-2 justify-center items-center rounded-md bg-black border-none shrink-0 gap-0"
            : "w-full"
        }
      >
        {variant === "compact" ? null : (
          <span className="truncate text-left flex-1">
            {selectedDrone ? selectedDrone.name : loading ? "Loading..." : "Select a drone"}
          </span>
        )}
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
  );

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm">
          {selectedDrone ? selectedDrone.name : loading ? "Loading..." : "Select drone"}
        </span>
        {select}
      </div>
    );
  }

  return <div className="mt-4">{select}</div>;
}