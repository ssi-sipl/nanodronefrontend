"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Full-screen control view manages its own chrome.
  if (pathname.startsWith("/drones/control")) {
    return <>{children}</>;
  }

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />
      <Topbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} sidebarWidth={sidebarWidth} />
      <main
        className="pt-16 transition-all duration-200 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}