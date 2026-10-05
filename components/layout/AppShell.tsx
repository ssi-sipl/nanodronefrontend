"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [Topcollapse,setTopcollapse] = useState(false);

  // Full-screen control view manages its own chrome.

  const sidebarWidth = collapsed ? 64 : 240;
  const topbarWidth = Topcollapse ? 0 : 40;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={()=> setCollapsed((c)=> !c)} />
      {/* <Topbar Topcollapse={Topcollapse} onToggle={() => setTopcollapse((c) => !c)} sidebarWidth={sidebarWidth} topbarWidth={topbarWidth} /> */}
      <main
        className="h-screen transition-all duration-200"
        style={{marginLeft: sidebarWidth, marginTop:topbarWidth }}
      >
        {children}
      </main>
    </div>
  );
}