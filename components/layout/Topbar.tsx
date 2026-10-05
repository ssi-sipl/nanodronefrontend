"use client";

import { usePathname } from "next/navigation";
import { Menu, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { NextResponse } from "next/server";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/areas": "Area Management",
  "/drones": "Drone Management",
  "/sensors": "Sensor Management",
  "/live-view": "Live Streams",
  "/maps/download": "Offline Maps",
  "/account": "Account",
};

function resolveTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = Object.keys(TITLES).find((key) => key !== "/" && pathname.startsWith(key));
  return match ? TITLES[match] : "Drone Management";
}

interface TopbarProps {
  Topcollapse: boolean;
  onToggle: () => void;
  sidebarWidth: number;
  topbarWidth: number;
}

export function Topbar({ Topcollapse, onToggle, sidebarWidth, topbarWidth }: TopbarProps) {
  const pathname = usePathname();
  const [mapname, setmapname] = useState<string | null>(null);

  useEffect(() => {
    async function fetchmapname() {
      try {
        const response = await fetch(`/api/offline-maps/active`);

        if (!response) {
          throw new Error("Failed to fetch activemap");
        }
        const result = await response.json();

        setmapname(result.data?.name ?? null);
      } catch (error) {
        console.log("failed to fetch activemap", error);
        setmapname(null);
      }
    }

    fetchmapname();

  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 bg-white border-b flex items-center justify-between px-4 z-20 transition-all duration-200",
        Topcollapse ? "h-0" : "h-10"
      )}
      style={{ left: sidebarWidth }}
    >
      {!Topcollapse && (
        <>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {resolveTitle(pathname)}
            </h1>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="font-bold whitespace-nowrap">
              Location: {mapname || "No active map"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Admin
            </span>

            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </>
      )}
      <button
        className="absolute top-full left-1/2 z-50 grid h-5 w-10 -translate-x-1/2 place-items-center
        rounded-b-xl bg-[#0F2A24] text-white/70 transition-colors
        hover:text-[#7CF0C0]
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-[#7CF0C0]"
        onClick={onToggle}
        aria-label="Topbar-Toggle"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            !Topcollapse && "rotate-180"
          )}
        />
      </button>
    </header>
  );
}