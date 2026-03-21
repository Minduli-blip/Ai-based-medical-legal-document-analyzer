"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, ScanSearch, Loader2, X } from "lucide-react"

interface UploadZoneProps {
  onScanComplete?: () => void
}

export default function UploadZone({ onScanComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle")
  const [scanProgress, setScanProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      setScanState("idle")
      setScanProgress(0)
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFileName(file.name)
        setScanState("idle")
        setScanProgress(0)
      }
    },
    []
  )

  const handleRemoveFile = useCallback(() => {
    setFileName(null)
    setScanState("idle")
    setScanProgress(0)
  }, [])

  const handleScan = useCallback(() => {
    setScanState("scanning")
    setScanProgress(0)

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanState("complete")
          onScanComplete?.()
          return 100
        }
        return prev + 4
      })
    }, 80)
  }, [onScanComplete])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Upload Legal Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : fileName
                ? "border-[hsl(var(--success))] bg-[hsl(var(--success))]/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileName ? (
            <>
              <FileText className="w-10 h-10 text-[hsl(var(--success))]" />
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                Click or drag to replace
              </p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your PDF or image here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, PNG, JPG up to 25MB
                </p>
              </div>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
          />
        </label>

        {fileName && (
          <div className="mt-4 flex flex-col gap-3">
            {/* File info bar */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemoveFile()
                }}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scan button / progress */}
            {scanState === "idle" && (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleScan()
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <ScanSearch className="w-5 h-5 mr-2" />
                Scan Document
              </Button>
            )}

            {scanState === "scanning" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing document with AI...</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{scanProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-100"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Extracting text, detecting clauses, assessing risk...
                </p>
              </div>
            )}

            {scanState === "complete" && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--success))]/10 px-4 py-3 border border-[hsl(var(--success))]/20">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--success))] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--success))]">Scan Complete</p>
                  <p className="text-xs text-muted-foreground">
                    3 clauses detected, risk analysis ready below
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
