"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  CheckCircle2,
  Scale,
  CalendarCheck,
  MessageSquareText,
} from "lucide-react"

export default function AuthPage({
  onLogin,
  onAdminLogin,
}: {
  onLogin: () => void
  onAdminLogin: () => void
}) {
  const [activeTab, setActiveTab] = useState("signin")

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 bg-[hsl(var(--navy))] text-[hsl(210,40%,98%)] relative overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
              <pattern
                id="dots"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="15" cy="15" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[hsl(var(--primary))]">
              <Shield className="w-7 h-7 text-[hsl(0,0%,100%)]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[hsl(214,32%,91%)]">
              AI Legal Analyzer
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-6 text-balance text-[hsl(0,0%,100%)]">
            AI Legal Analyzer & Risk Predictor
          </h1>

          <p className="text-lg leading-relaxed mb-10 text-[hsl(215,20%,65%)]">
            Upload complex contracts. Understand hidden risks. Make informed
            decisions.
          </p>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[hsl(var(--navy-light))]">
                <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="font-medium text-[hsl(210,40%,98%)]">Automated Risk Assessment</p>
                <p className="text-sm text-[hsl(215,20%,65%)]">
                  Low / Medium / High classification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[hsl(var(--navy-light))]">
                <MessageSquareText className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-medium text-[hsl(210,40%,98%)]">Simple Clause Explanations</p>
                <p className="text-sm text-[hsl(215,20%,65%)]">
                  AI-powered plain English summaries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[hsl(var(--navy-light))]">
                <CalendarCheck className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <p className="font-medium text-[hsl(210,40%,98%)]">Google Calendar Deadline Sync</p>
                <p className="text-sm text-[hsl(215,20%,65%)]">
                  Never miss a critical date
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-2 text-sm text-[hsl(215,20%,65%)]">
            <Scale className="w-4 h-4" />
            <span>Trusted by 2,500+ legal professionals</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              AI Legal Analyzer
            </span>
          </div>

          <Card className="border border-border shadow-lg">
            <CardContent className="p-8">
              <Tabs

                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      onLogin()
                    }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@lawfirm.com"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox id="remember" />
                        <Label
                          htmlFor="remember"
                          className="text-sm font-normal text-muted-foreground cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full mt-2" size="lg">
                      Sign In
                    </Button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground">
                          OR
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign in with Google
                    </Button>
                  </form>
                </TabsContent>

                {/* Create Account */}
                <TabsContent value="register">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      onLogin()
                    }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-email">Email Address</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@lawfirm.com"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-confirm">Confirm Password</Label>
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="Confirm your password"
                      />
                    </div>
                    <Button type="submit" className="w-full mt-2" size="lg">
                      Register Account
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      By registering, you agree to our secure data privacy
                      terms.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <button
              onClick={onAdminLogin}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
