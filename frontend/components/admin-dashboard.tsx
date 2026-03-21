"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  AlertTriangle,
  Activity,
  TrendingUp,
  Search,
  MoreHorizontal,
  UserX,
  Eye,
  BarChart3,
  Settings,
  Save,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts"

// Admin overview stats
function AdminOverview() {
  const stats = [
    {
      label: "Total Users",
      value: "284",
      change: "+12 this week",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Documents",
      value: "1,847",
      change: "+89 this week",
      icon: FileText,
      color: "text-[hsl(var(--success))]",
      bg: "bg-[hsl(var(--success))]/10",
    },
    {
      label: "Avg Risk Score",
      value: "52/100",
      change: "-3 from last week",
      icon: AlertTriangle,
      color: "text-[hsl(var(--warning))]",
      bg: "bg-[hsl(var(--warning))]/10",
    },
    {
      label: "Active Sessions",
      value: "38",
      change: "Online now",
      icon: Activity,
      color: "text-[hsl(var(--accent))]",
      bg: "bg-[hsl(var(--accent))]/10",
    },
  ]

  const weeklyData = [
    { day: "Mon", docs: 32 },
    { day: "Tue", docs: 45 },
    { day: "Wed", docs: 28 },
    { day: "Thu", docs: 52 },
    { day: "Fri", docs: 41 },
    { day: "Sat", docs: 15 },
    { day: "Sun", docs: 12 },
  ]

  return (
    <div className="flex flex-col gap-6">
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
                  <p className="text-xs text-muted-foreground mt-0.5">{s.change}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Documents Analyzed This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="docs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// User management table
function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionOpen, setActionOpen] = useState<number | null>(null)

  const users = [
    { id: 1, name: "John Doe", email: "john@legalfirm.com", role: "User", docs: 24, lastActive: "2 hours ago", status: "active" },
    { id: 2, name: "Sarah Chen", email: "sarah@lawcorp.com", role: "User", docs: 57, lastActive: "30 min ago", status: "active" },
    { id: 3, name: "Mike Wilson", email: "mike@legal.co", role: "User", docs: 12, lastActive: "3 days ago", status: "inactive" },
    { id: 4, name: "Emma Davis", email: "emma@contracts.io", role: "User", docs: 89, lastActive: "1 hour ago", status: "active" },
    { id: 5, name: "Alex Johnson", email: "alex@lawdocs.com", role: "User", docs: 34, lastActive: "5 hours ago", status: "active" },
    { id: 6, name: "Lisa Park", email: "lisa@legaltech.com", role: "User", docs: 6, lastActive: "2 weeks ago", status: "inactive" },
  ]

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filtered.length} users
        </Badge>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Documents</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Last Active</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{user.docs}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.lastActive}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          user.status === "active"
                            ? "text-[hsl(var(--success))] border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/10"
                            : "text-muted-foreground border-border bg-muted/50"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setActionOpen(actionOpen === user.id ? null : user.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {actionOpen === user.id && (
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                            <button
                              onClick={() => setActionOpen(null)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted w-full text-left"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Details
                            </button>
                            <button
                              onClick={() => setActionOpen(null)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--danger))] hover:bg-muted w-full text-left"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics tab
function AnalyticsTab() {
  const uploadTrend = [
    { month: "Sep", docs: 120 },
    { month: "Oct", docs: 185 },
    { month: "Nov", docs: 210 },
    { month: "Dec", docs: 165 },
    { month: "Jan", docs: 240 },
    { month: "Feb", docs: 289 },
  ]

  const riskDistribution = [
    { name: "Low Risk", value: 42, color: "hsl(142, 71%, 45%)" },
    { name: "Medium Risk", value: 35, color: "hsl(47, 96%, 53%)" },
    { name: "High Risk", value: 23, color: "hsl(0, 84%, 60%)" },
  ]

  const clauseTypes = [
    { type: "Indemnification", count: 312 },
    { type: "Liability Limit", count: 278 },
    { type: "Non-Compete", count: 195 },
    { type: "Termination", count: 245 },
    { type: "Confidentiality", count: 356 },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Trend */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">
              Documents Uploaded Over Time
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={uploadTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="docs" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-muted-foreground">{r.name} ({r.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clause Types */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Most Common Clause Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clauseTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Documents tab
function DocumentsTab() {
  const documents = [
    { id: 1, name: "NDA_Contract_2026.pdf", user: "John Doe", date: "Feb 14, 2026", risk: "Medium", clauses: 4 },
    { id: 2, name: "Vendor_Agreement_v3.pdf", user: "Sarah Chen", date: "Feb 13, 2026", risk: "High", clauses: 6 },
    { id: 3, name: "Employee_Contract.pdf", user: "Emma Davis", date: "Feb 12, 2026", risk: "Low", clauses: 2 },
    { id: 4, name: "License_Agreement.pdf", user: "Alex Johnson", date: "Feb 11, 2026", risk: "Medium", clauses: 5 },
    { id: 5, name: "Partnership_Terms.pdf", user: "Sarah Chen", date: "Feb 10, 2026", risk: "High", clauses: 7 },
  ]

  const riskColorMap: Record<string, string> = {
    Low: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20",
    Medium: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20",
    High: "text-[hsl(var(--danger))] bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20",
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          All Analyzed Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Document</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Uploaded By</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Risk Level</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">Clauses</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{doc.user}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{doc.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${riskColorMap[doc.risk]}`}>
                      {doc.risk}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{doc.clauses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Settings tab
function AdminSettings() {
  const [saved, setSaved] = useState(false)

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold text-foreground">
            Platform Settings
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 max-w-lg">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Platform Name</label>
            <Input defaultValue="AI Legal Analyzer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Max Upload Size (MB)</label>
            <Input type="number" defaultValue="25" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Admin Contact Email</label>
            <Input type="email" defaultValue="admin@legalanalyzer.com" />
          </div>
          <Button
            className="w-fit bg-[hsl(var(--danger))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--danger))]/90"
            onClick={() => {
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Tab config
const TAB_CONFIG: Record<string, { title: string; description: string }> = {
  overview: {
    title: "Admin Overview",
    description: "Platform-wide statistics and weekly activity.",
  },
  users: {
    title: "User Management",
    description: "View and manage all registered users on the platform.",
  },
  analytics: {
    title: "Platform Analytics",
    description: "Usage trends, risk distribution, and clause analysis.",
  },
  documents: {
    title: "Document Oversight",
    description: "Browse all documents analyzed on the platform.",
  },
  settings: {
    title: "Platform Settings",
    description: "Configure platform-wide settings and preferences.",
  },
}

interface AdminDashboardContentProps {
  activeTab: string
}

export default function AdminDashboardContent({ activeTab }: AdminDashboardContentProps) {
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.overview

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

        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </main>
  )
}
