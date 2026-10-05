"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Plane,
  Radio,
  Video,
  Map,
  LogOut,
  ChevronLeft,
  Joystick
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/areas", label: "Area", icon: MapPin },
  { href: "/drones", label: "Drones", icon: Plane },
  { href: "/sensors", label: "Sensors", icon: Radio },
  { href: "/live-view", label: "Livestream", icon: Video },
  { href: "/maps/download", label: "Maps", icon: Map },
  { href: "/drones/control", label: "Drone Control", icon: Joystick },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle:()=>void;
}



export function Sidebar({ collapsed,onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hidesidebar = pathname === "/login";
  if(hidesidebar) {
  return null;
}

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 z-30",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border shrink-0">
        <span className={cn("font-bold text-sidebar-primary-foreground", collapsed ? "text-lg" : "text-base")}>
          {collapsed ? "DM" : "Drone Managment"}
        </span>
      </div>

      <button
      onClick={onToggle}
      className="absolute left-full top-1/2 z-50 grid h-10 w-5 -translate-y-1/2 place-items-center
          rounded-r-xl bg-[#0F2A24] text-white/70 transition-colors hover:text-[#7CF0C0]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7CF0C0]"
      aria-label="Toggle sidebar"
      >
      <ChevronLeft
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          collapsed && "rotate-180"
        )}
      />
      </button>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActiveLink(link.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}