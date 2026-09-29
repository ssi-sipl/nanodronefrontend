"use client";

import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
  collapsed: boolean;
  onToggle: () => void;
  sidebarWidth: number;
}

export function Topbar({ collapsed, onToggle, sidebarWidth }: TopbarProps) {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-20 transition-all duration-200"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{resolveTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
    </header>
  );
}