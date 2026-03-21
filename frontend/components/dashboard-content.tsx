"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  Upload as UploadIcon,
  ArrowRight,
} from "lucide-react"
import UploadZone from "@/components/upload-zone"
import OcrClausePanel from "@/components/ocr-clause-panel"
import RiskGauge from "@/components/risk-gauge"
import CalendarSync from "@/components/calendar-sync"
import UserProfile from "@/components/user-profile"

interface DashboardContentProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// Overview stat cards for the "dashboard" home tab
function OverviewStats({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const stats = [
    {
      label: "Documents Analyzed",
      value: "12",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Avg Risk Score",
      value: "54/100",
      icon: AlertTriangle,
      color: "text-[hsl(var(--warning))]",
      bg: "bg-[hsl(var(--warning))]/10",
    },
    {
      label: "Clauses Detected",
      value: "38",
      icon: TrendingUp,
      color: "text-[hsl(var(--success))]",
      bg: "bg-[hsl(var(--success))]/10",
    },
    {
      label: "Upcoming Deadlines",
      value: "4",
      icon: CalendarDays,
      color: "text-[hsl(var(--accent))]",
      bg: "bg-[hsl(var(--accent))]/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("upload")}
            >
              <UploadIcon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Upload & Scan</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("calendar")}
            >
              <CalendarDays className="w-6 h-6 text-[hsl(var(--accent))]" />
              <span className="text-sm font-medium text-foreground">View Deadlines</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange("profile")}
            >
              <FileText className="w-6 h-6 text-[hsl(var(--success))]" />
              <span className="text-sm font-medium text-foreground">My Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Recent Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              onClick={() => onTabChange("upload")}
            >
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[
              {
                name: "NDA_Contract_2026.pdf",
                date: "Feb 14, 2026",
                risk: "Medium",
                riskColor: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10",
              },
              {
                name: "Vendor_Agreement_v3.pdf",
                date: "Feb 12, 2026",
                risk: "High",
                riskColor: "text-[hsl(var(--danger))] bg-[hsl(var(--danger))]/10",
              },
              {
                name: "Employee_Contract.pdf",
                date: "Feb 10, 2026",
                risk: "Low",
                riskColor: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10",
              },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md ${doc.riskColor}`}
                >
                  {doc.risk}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Upload tab with scan workflow
function UploadTab() {
  const [scanned, setScanned] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <UploadZone onScanComplete={() => setScanned(true)} />
      {scanned && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OcrClausePanel />
          <RiskGauge />
        </div>
      )}
    </div>
  )
}

const TAB_CONFIG: Record<
  string,
  { title: string; description: string }
> = {
  dashboard: {
    title: "Document Analysis Dashboard",
    description: "Overview of your document analysis activity and quick actions.",
  },
  upload: {
    title: "Upload & Scan Document",
    description: "Upload a legal document and scan it to extract clauses and assess risk.",
  },
  calendar: {
    title: "Calendar & Deadlines",
    description: "Manage your extracted deadlines and sync them to Google Calendar.",
  },
  profile: {
    title: "User Profile",
    description: "Manage your account information and view activity stats.",
  },
}

export default function DashboardContent({ activeTab, onTabChange }: DashboardContentProps) {
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.dashboard

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="px-6 py-6 lg:px-10 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {config.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
        </div>

        {activeTab === "dashboard" && <OverviewStats onTabChange={onTabChange} />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "calendar" && <CalendarSync />}
        {activeTab === "profile" && <UserProfile />}
      </div>
    </main>
  )
}
