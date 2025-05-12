import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";  // Assuming you have a NavBar component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drone Management Dashboard",
  description: "Dashboard for managing and controlling drones",
  generator: 'v0.dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Navbar / Sidebar */}
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
