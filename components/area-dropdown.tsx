"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseUrl } from "@/lib/config";

type Area = {
  name: string;
  area_id: string;
};

type AreaDropdownProps = {
  selectedAreaId: string | null;
  setSelectedAreaId: (value: string) => void;
};

export function AreaDropdown({
  selectedAreaId,
  setSelectedAreaId,
}: AreaDropdownProps) {
  const [drones, setDrones] = useState<Area[]>([]);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await fetch(`${baseUrl}/areas`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setDrones(data || []);
            console.log("Areas fetched successfully:", data);
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
        value={selectedAreaId || ""}
        onValueChange={(value) => setSelectedAreaId(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a Area" />
        </SelectTrigger>
        <SelectContent>
          {drones.length > 0 ? (
            drones.map((drone) => (
              <SelectItem key={drone.name} value={drone.area_id}>
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
