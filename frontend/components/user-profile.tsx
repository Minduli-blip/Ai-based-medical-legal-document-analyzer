"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building2, Shield, Save, FileText } from "lucide-react"

export default function UserProfile() {
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@legalfirm.com")
  const [company, setCompany] = useState("Legal Solutions Inc.")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">
              User Profile
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            {/* Avatar section */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    User
                  </Badge>
                  <span className="text-xs text-muted-foreground">Member since Jan 2026</span>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-company" className="text-sm font-medium text-foreground">
                  Company / Firm
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="profile-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Account Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Documents Scanned</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Shield className="w-5 h-5 text-[hsl(var(--warning))] mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">54</p>
              <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <FileText className="w-5 h-5 text-[hsl(var(--success))] mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">38</p>
              <p className="text-xs text-muted-foreground">Clauses Detected</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Mail className="w-5 h-5 text-[hsl(var(--accent))] mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-xs text-muted-foreground">Calendar Events</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
