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
  disabled?: boolean;
};

export function AreaDropdown({
  selectedAreaId,
  setSelectedAreaId,
  disabled = false,
}: AreaDropdownProps) {
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`${baseUrl}/areas`);
        const response = await res.json();
        if (response.status) {
          if (response.data) {
            const data = response.data;
            setAreas(data || []);
            console.log("Areas fetched successfully:", data);
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

  return (
    <div className="mt-4 z-50">
      <Select
        value={selectedAreaId || ""}
        onValueChange={(value) => setSelectedAreaId(value)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a Area" />
        </SelectTrigger>
        <SelectContent className="z-50">
          {areas.length > 0 ? (
            areas.map((area) => (
              <SelectItem key={area.name} value={area.area_id}>
                {area.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No areas available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
