import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NavBar } from "@/components/nav-bar"
import { DroneProvider } from "@/components/drone-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Drone Management Dashboard",
  description: "Dashboard for managing and controlling drones",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DroneProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>
          </div>
        </DroneProvider>
      </body>
    </html>
  )
}
