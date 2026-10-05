"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Layers, Check, Loader2, MapIcon } from "lucide-react";

type OfflineMap = {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
};

interface MapSwitcherPopoverButtonProps {
  onMapChanged: () => void; // called after a map is activated, to refresh the displayed map
}

export function MapSwitcherPopoverButton({ onMapChanged }: MapSwitcherPopoverButtonProps) {
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState<OfflineMap[]>([]);
  const [loading, setLoading] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const loadMaps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/offline-maps", { cache: "no-store" });
      const data = await res.json();
      if (data.status) {
        setMaps((data.data || []).filter((m: OfflineMap) => m.status === "completed"));
      }
    } catch {
      // ignore — panel just shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadMaps();
  }, [open, loadMaps]);

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    try {
      const res = await fetch(`/api/offline-maps/activate/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.status) {
        await loadMaps();
        onMapChanged();
        setOpen(false);
      }
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="bg-white w-10 h-10 rounded-lg shadow flex items-center justify-center hover:bg-gray-100 border border-gray-200"
          title="Change map"
        >
          <MapIcon className="w-5 h-5 text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[85vw] max-w-xs max-h-[70vh] overflow-y-auto p-2"
      >
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Downloaded Maps</p>
        {loading ? (
          <p className="text-sm text-muted-foreground px-2 py-3">Loading...</p>
        ) : maps.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-3">No downloaded maps yet.</p>
        ) : (
          <div className="space-y-1">
            {maps.map((map) => (
              <button
                key={map.id}
                onClick={() => handleActivate(map.id)}
                disabled={map.isActive || activatingId !== null}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent disabled:opacity-60 disabled:cursor-default text-left"
              >
                <span className="truncate">{map.name}</span>
                {activatingId === map.id ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : map.isActive ? (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}