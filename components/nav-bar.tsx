"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Drone Management</h1>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname === "/" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname === "/settings" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
