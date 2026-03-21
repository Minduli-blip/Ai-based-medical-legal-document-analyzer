"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  CalendarDays,
  User,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Upload, label: "Upload Document", id: "upload" },
  { icon: CalendarDays, label: "Calendar Sync", id: "calendar" },
  { icon: User, label: "User Profile", id: "profile" },
]

export default function MobileHeader({
  activeTab,
  onTabChange,
  onLogout,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="md:hidden bg-[hsl(var(--navy))] text-[hsl(210,40%,98%)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold text-sm">AI Legal Analyzer</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-[hsl(var(--navy-light))] transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <nav className="flex flex-col gap-1 px-3 pb-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setIsOpen(false)
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === item.id
                  ? "bg-[hsl(var(--primary))] text-[hsl(0,0%,100%)]"
                  : "text-[hsl(215,20%,65%)] hover:bg-[hsl(var(--navy-light))]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[hsl(215,20%,65%)] hover:bg-[hsl(var(--navy-light))] transition-colors text-left mt-2 border-t border-[hsl(var(--navy-light))] pt-3"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      )}
    </header>
  )
}
