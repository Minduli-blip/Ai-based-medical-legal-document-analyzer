"use client"

import { useState } from "react"
import AuthPage from "@/components/auth-page"
import AdminAuthPage from "@/components/admin-auth-page"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardContent from "@/components/dashboard-content"
import MobileHeader from "@/components/mobile-header"
import AdminSidebar from "@/components/admin-sidebar"
import AdminDashboardContent from "@/components/admin-dashboard"
import AdminMobileHeader from "@/components/admin-mobile-header"
import ChatAssistant from "@/components/chat-assistant"
import DashboardHeader from "@/components/dashboard-header"

type AppView =
  | "user-login"
  | "admin-login"
  | "user-dashboard"
  | "admin-dashboard"

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("user-login")
  const [userTab, setUserTab] = useState("dashboard")
  const [adminTab, setAdminTab] = useState("overview")

  function handleLogout() {
    setCurrentView("user-login")
    setUserTab("dashboard")
    setAdminTab("overview")
  }

  // User login page
  if (currentView === "user-login") {
    return (
      <AuthPage
        onLogin={() => setCurrentView("user-dashboard")}
        onAdminLogin={() => setCurrentView("admin-login")}
      />
    )
  }

  // Admin login page
  if (currentView === "admin-login") {
    return (
      <AdminAuthPage
        onLogin={() => setCurrentView("admin-dashboard")}
        onBackToUserLogin={() => setCurrentView("user-login")}
      />
    )
  }

  // User dashboard
  if (currentView === "user-dashboard") {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar
          activeTab={userTab}
          onTabChange={setUserTab}
        />
        <div className="flex flex-col flex-1 min-h-screen">
          <MobileHeader
            activeTab={userTab}
            onTabChange={setUserTab}
            onLogout={handleLogout}
          />
          <DashboardHeader onLogout={handleLogout} userName="John Doe" role="user" />
          <DashboardContent activeTab={userTab} onTabChange={setUserTab} />
        </div>
        <ChatAssistant />
      </div>
    )
  }

  // Admin dashboard
  if (currentView === "admin-dashboard") {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar
          activeTab={adminTab}
          onTabChange={setAdminTab}
        />
        <div className="flex flex-col flex-1 min-h-screen">
          <AdminMobileHeader
            activeTab={adminTab}
            onTabChange={setAdminTab}
            onLogout={handleLogout}
          />
          <DashboardHeader onLogout={handleLogout} userName="Admin" role="admin" />
          <AdminDashboardContent activeTab={adminTab} />
        </div>
      </div>
    )
  }

  return null
}
