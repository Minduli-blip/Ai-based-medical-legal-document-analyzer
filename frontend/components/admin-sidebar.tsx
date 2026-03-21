"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  ShieldCheck,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Users, label: "User Management", id: "users" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: FileText, label: "Documents", id: "documents" },
  { icon: Settings, label: "Settings", id: "settings" },
]

export default function AdminSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[hsl(var(--navy))] text-[hsl(214,32%,91%)] min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[hsl(var(--navy-light))]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--danger))]/15">
          <ShieldCheck className="w-5 h-5 text-[hsl(var(--danger))]" />
        </div>
        <div>
          <span className="font-semibold text-[hsl(0,0%,100%)] tracking-tight text-sm block">
            Admin Portal
          </span>
          <span className="text-[10px] text-[hsl(215,20%,65%)]">AI Legal Analyzer</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === item.id
                ? "bg-[hsl(var(--danger))]/15 text-[hsl(var(--danger))]"
                : "text-[hsl(215,20%,65%)] hover:bg-[hsl(var(--navy-light))] hover:text-[hsl(210,40%,98%)]"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>


    </aside>
  )
}
