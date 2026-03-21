"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  BarChart3,
  FileSearch,
  ArrowLeft,
} from "lucide-react"

interface AdminAuthPageProps {
  onLogin: () => void
  onBackToUserLogin: () => void
}

export default function AdminAuthPage({ onLogin, onBackToUserLogin }: AdminAuthPageProps) {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="lg:w-1/2 bg-[hsl(var(--navy))] flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10 max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--danger))]/15 border border-[hsl(var(--danger))]/20">
              <ShieldCheck className="w-7 h-7 text-[hsl(var(--danger))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(0,0%,100%)] tracking-tight">
                Admin Portal
              </h1>
              <p className="text-sm text-[hsl(215,20%,65%)]">
                AI Legal Analyzer
              </p>
            </div>
          </div>

          <p className="text-[hsl(214,32%,91%)] text-lg leading-relaxed mb-10">
            Manage your platform, oversee user activity, and monitor document analytics from one control center.
          </p>

          <div className="flex flex-col gap-5">
            {[
              {
                icon: Users,
                title: "User Management",
                desc: "View and manage all user accounts, activity, and permissions.",
              },
              {
                icon: BarChart3,
                title: "Platform Analytics",
                desc: "Track document uploads, risk scores, and usage trends.",
              },
              {
                icon: FileSearch,
                title: "Document Oversight",
                desc: "Monitor all analyzed documents and flagged content.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--navy-light))] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-[hsl(var(--danger))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(0,0%,100%)]">{item.title}</p>
                  <p className="text-xs text-[hsl(215,20%,65%)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md">
          <button
            onClick={onBackToUserLogin}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User Login
          </button>

          <Card className="border-border shadow-lg">
            <CardHeader className="pb-4 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--danger))]/10 mx-auto mb-3">
                <ShieldCheck className="w-7 h-7 text-[hsl(var(--danger))]" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Admin Sign In
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Authorized personnel only
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                    Admin Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@legalanalyzer.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[hsl(var(--danger))] text-[hsl(0,0%,100%)] hover:bg-[hsl(var(--danger))]/90 mt-2"
                  size="lg"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Sign In to Admin Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
