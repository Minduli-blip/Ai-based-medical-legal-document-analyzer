"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Bell, User } from "lucide-react"

export default function DashboardHeader({
  onLogout,
  userName = "John Doe",
  role = "user",
}: {
  onLogout: () => void
  userName?: string
  role?: "user" | "admin"
}) {
  return (
    <header className="hidden md:flex items-center justify-between px-6 lg:px-10 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {role === "admin" ? "Admin Portal" : "User Dashboard"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(var(--danger))] rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{role}</p>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))]/10 gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
