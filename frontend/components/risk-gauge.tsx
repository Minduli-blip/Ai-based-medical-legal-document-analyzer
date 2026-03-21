"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Lightbulb } from "lucide-react"

const riskScore = 68 // 0–100

function getRotation(score: number) {
  // Map 0–100 to -90deg to 90deg
  return -90 + (score / 100) * 180
}

function getRiskLabel(score: number) {
  if (score < 35) return { label: "Low Risk", color: "hsl(142, 71%, 45%)" }
  if (score < 65) return { label: "Medium Risk", color: "hsl(47, 96%, 53%)" }
  return { label: "High Risk", color: "hsl(0, 84%, 60%)" }
}

export default function RiskGauge() {
  const rotation = getRotation(riskScore)
  const risk = getRiskLabel(riskScore)

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--danger))]" />
          <CardTitle className="text-lg font-semibold text-foreground">
            Red Flag Risk Dashboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Speedometer Gauge */}
        <div className="relative w-52 h-28">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Green segment */}
            <path
              d="M 20 100 A 80 80 0 0 1 66 32"
              fill="none"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Yellow segment */}
            <path
              d="M 66 32 A 80 80 0 0 1 134 32"
              fill="none"
              stroke="hsl(47, 96%, 53%)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Red segment */}
            <path
              d="M 134 32 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Needle */}
            <g transform={`rotate(${rotation}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="hsl(var(--foreground))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="6"
                fill="hsl(var(--foreground))"
              />
            </g>
            {/* Labels */}
            <text
              x="22"
              y="108"
              fontSize="9"
              fill="hsl(142, 71%, 45%)"
              fontWeight="600"
            >
              Safe
            </text>
            <text
              x="88"
              y="18"
              fontSize="9"
              fill="hsl(47, 96%, 53%)"
              fontWeight="600"
            >
              Caution
            </text>
            <text
              x="156"
              y="108"
              fontSize="9"
              fill="hsl(0, 84%, 60%)"
              fontWeight="600"
            >
              Danger
            </text>
          </svg>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: risk.color }}>
            {risk.label}
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {riskScore}/100
          </p>
        </div>

        {/* AI Recommendations */}
        <div className="w-full bg-muted rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              AI Recommendations
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--danger))] mt-1.5 shrink-0" />
              Review the non-compete clause - 5 years / 200 miles may be
              unenforceable in many jurisdictions.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))] mt-1.5 shrink-0" />
              Consider negotiating the liability limitation to include a cap on
              direct damages.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] mt-1.5 shrink-0" />
              The indemnification clause appears standard and reciprocal.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
