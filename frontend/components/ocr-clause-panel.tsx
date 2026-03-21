"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSearch } from "lucide-react"

const sampleText = [
  { text: "This Agreement is entered into as of January 15, 2026, by and between Party A (\"The Licensor\") and Party B (\"The Licensee\").", highlighted: false },
  { text: "The Licensee shall indemnify and hold harmless the Licensor from any claims, damages, or liabilities arising from the Licensee's use of the licensed material.", highlighted: true, tag: "Indemnification" },
  { text: "This agreement shall remain in effect for a period of twenty-four (24) months from the effective date, unless terminated earlier in accordance with Section 7.", highlighted: false },
  { text: "In no event shall the Licensor be liable for any indirect, incidental, special, or consequential damages, regardless of the cause of action.", highlighted: true, tag: "Liability Limitation" },
  { text: "Either party may terminate this Agreement upon thirty (30) days written notice to the other party.", highlighted: false },
  { text: "The Licensee agrees to a non-compete restriction for a period of five (5) years following termination of this agreement within a 200-mile radius.", highlighted: true, tag: "Non-Compete" },
]

export default function OcrClausePanel() {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">
              Extracted Document Text
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            3 Clauses Detected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 max-h-[320px] overflow-y-auto space-y-3 text-sm leading-relaxed">
          {sampleText.map((segment, i) => (
            <p key={i} className={segment.highlighted ? "bg-[hsl(var(--warning))]/15 border-l-4 border-[hsl(var(--warning))] pl-3 py-2 rounded-r-md" : "text-muted-foreground"}>
              {segment.highlighted && segment.tag && (
                <Badge className="mb-1 text-[10px] bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/30">
                  {segment.tag}
                </Badge>
              )}
              <span className={segment.highlighted ? "block mt-1 text-foreground" : ""}>
                {segment.text}
              </span>
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
