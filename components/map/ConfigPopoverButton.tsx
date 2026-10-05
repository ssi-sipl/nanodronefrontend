"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Send, X } from "lucide-react";
import { ConfigurationPanel } from "@/components/configuration-panel";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface ConfigPopoverButtonProps {
  currentSensor: Sensor | null;
  setIsLoading: (value: boolean) => void;
  setLoadingStatus: (value: string) => void;
}

export function ConfigPopoverButton({ currentSensor, setIsLoading, setLoadingStatus }: ConfigPopoverButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`bg-white w-10 h-10 rounded-lg shadow flex items-center justify-center hover:bg-gray-100 border ${
            open ? "border-primary" : "border-gray-200"
          }`}
          title="Configuration"
        >
          <Send className="w-5 h-5 text-gray-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[92vw] max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-10">
          <span className="text-sm font-semibold">Configuration</span>
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <ConfigurationPanel
          currentSensor={currentSensor}
          setIsLoading={setIsLoading}
          setLoadingStatus={setLoadingStatus}
        />
      </PopoverContent>
    </Popover>
  );
}