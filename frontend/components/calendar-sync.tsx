"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  CalendarDays,
  Check,
  Bell,
  Clock,
  AlertTriangle,
  Trash2,
  CalendarCheck,
  Pencil,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type HHMM = `${number}${number}:${number}${number}` | ""

interface Deadline {
  id: number
  title: string
  date: string // YYYY-MM-DD
  time: HHMM // "HH:MM" 24h or ""
}

/**
 * Backend (FastAPI) returns something like:
 * [
 *   { event_id: 1, title: "...", event_date: "2026-05-15", event_time: "09:00", status: "draft", google_event_id: null }
 * ]
 */
interface DbEvent {
  event_id: number
  title: string
  event_date: string // YYYY-MM-DD
  event_time: string | number | null // can be "09:00", "09:00:00", 32400, null
  status?: string
  google_event_id?: string | null
}

// ✅ Use ONE base URL everywhere (don't mix localhost and 127.0.0.1)
const API_BASE = "http://127.0.0.1:8000"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

function parseISOToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatDisplayDateFromDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(t: string) {
  return t ? t : "—"
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatCountdown(days: number): string {
  if (days < 0) return "Overdue"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days < 7) return `${days} days away`
  if (days < 30) return `${Math.ceil(days / 7)} weeks away`
  return `${Math.ceil(days / 30)} months away`
}

export default function CalendarSync() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [synced, setSynced] = useState<Set<number>>(new Set())
  const [dismissedReminders, setDismissedReminders] = useState<Set<number>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [activeDay, setActiveDay] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date>(new Date())

  const [eventPopupOpen, setEventPopupOpen] = useState(false)
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number }>({ x: 12, y: 12 })
  const calendarWrapRef = useRef<HTMLDivElement | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Deadline | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState<HHMM>("")

  const [editErrors, setEditErrors] = useState<{
  title?: string
  date?: string
  time?: string
  }>({})

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = 2020; y <= 2035; y++) arr.push(y)
    return arr
  }, [])

  // ✅ helper: normalize any time to HH:MM
  const toHHMM = (t: any): HHMM => {
    if (t === null || t === undefined) return "" as HHMM

    // if backend sends seconds like 32400
    if (typeof t === "number") {
      const total = Math.floor(t)
      const hh = Math.floor(total / 3600) % 24
      const mm = Math.floor((total % 3600) / 60)
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` as HHMM
    }

    const s = String(t)
    return s.length >= 5 ? (s.slice(0, 5) as HHMM) : ("" as HHMM)
  }

  // ✅ load events (reusable)
  const loadEvents = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch(`${API_BASE}/events`)
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(`Backend error: ${res.status} ${txt}`)
      }

      const data: DbEvent[] = await res.json()

      const mapped: Deadline[] = data.map((e) => ({
        id: e.event_id,
        title: e.title,
        date: e.event_date,
        time: toHHMM(e.event_time),
      }))

      setDeadlines(mapped)

      // synced ids from DB
      const syncedIds = new Set<number>(
        data.filter((e) => e.status === "synced" || !!e.google_event_id).map((e) => e.event_id)
      )
      setSynced(syncedIds)

      // adjust month view
      if (mapped.length > 0) {
        const first = parseISOToDate(mapped[0].date)
        setMonth(new Date(first.getFullYear(), first.getMonth(), 1))
      }
    } catch (err: any) {
      console.error(err)
      setLoadError(err?.message || "Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [])

  // initial load
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const deadlinesByDate = useMemo(() => {
    return deadlines.reduce<Record<string, Deadline[]>>((acc, d) => {
      ;(acc[d.date] ||= []).push(d)
      return acc
    }, {})
  }, [deadlines])

  const markedDates = useMemo(() => deadlines.map((d) => parseISOToDate(d.date)), [deadlines])
  const markedKeys = useMemo(() => new Set(deadlines.map((d) => d.date)), [deadlines])

  const activeKey = activeDay ? dateKey(activeDay) : null
  const activeEvents = activeKey ? deadlinesByDate[activeKey] || [] : []

  const syncedDeadlines = deadlines.filter((d) => synced.has(d.id))

  const urgentReminders = syncedDeadlines
    .map((d) => ({ ...d, daysUntil: getDaysUntil(d.date) }))
    .filter((d) => d.daysUntil <= 7 && !dismissedReminders.has(d.id))
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // ✅ Sync button -> calls backend /events/{id}/sync (POST)
const handleSync = useCallback(
  async (id: number) => {
    const ev = deadlines.find((d) => d.id === id)
    if (!ev) return

    // 🔴 Block past dates
    const today = new Date()
    const eventDate = new Date(ev.date)

    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)

    if (eventDate < today) {
      setToastMessage("Cannot sync past events")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/events/${id}/sync`, { method: "POST" })

      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(`Sync failed: ${res.status} ${txt}`)
      }

      setSynced((prev) => new Set(prev).add(id))
      if (ev) setToastMessage(`"${ev.title}" synced to Google Calendar`)

      await loadEvents()
    } catch (err: any) {
      console.error(err)
      setToastMessage(err?.message || "Sync failed")
    }
  },
  [deadlines, loadEvents]
)

  const handleUnsync = useCallback(
  async (id: number) => {
    const ev = deadlines.find((d) => d.id === id)

    try {
      const res = await fetch(`${API_BASE}/events/${id}/unsync`, {
        method: "POST",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.detail || `Unsync failed: ${res.status}`)
      }

      setSynced((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      if (ev) setToastMessage(`"${ev.title}" removed from Google Calendar`)

      await loadEvents()
    } catch (err: any) {
      console.error(err)
      setToastMessage(err?.message || "Unsync failed")
    }
  },
  [deadlines, loadEvents]
  )

  const handleDismissReminder = useCallback((id: number) => {
    setDismissedReminders((prev) => new Set(prev).add(id))
  }, [])

  const handleDelete = useCallback(
    async (id: number) => {
      // UI fast update
      setDeadlines((prev) => prev.filter((d) => d.id !== id))

      try {
        const res = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" })
        if (!res.ok) {
          const txt = await res.text().catch(() => "")
          throw new Error(`Delete failed: ${res.status} ${txt}`)
        }
        setToastMessage("Event deleted")
        await loadEvents()
      } catch (err: any) {
        console.error(err)
        setToastMessage(err?.message || "Delete failed")
        // re-load to recover UI if delete failed
        await loadEvents()
      }
    },
    [loadEvents]
  )

  const handleEditOpen = useCallback((d: Deadline) => {
    setEditing(d)
    setEditTitle(d.title)
    setEditDate(d.date)
    setEditTime(d.time || "")
    setEditOpen(true)
  }, [])

  function validateEditForm(title: string, date: string, time: string) {
  const errors: { title?: string; date?: string; time?: string } = {}

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    errors.title = "Title is required"
  } else if (trimmedTitle.length < 3) {
    errors.title = "Title must be at least 3 characters"
  } else if (trimmedTitle.length > 150) {
    errors.title = "Title must be less than 150 characters"
  }

  if (!date) {
    errors.date = "Date is required"
  } else {
    const selected = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selected < today) {
      errors.date = "Date cannot be in the past"
    }
  }

  if (!time) {
    errors.time = "Time is required"
  } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    errors.time = "Time must be in HH:MM format"
  }

  return errors
  }

  const handleEditSave = useCallback(async () => {
  if (!editing) return

  const title = editTitle.trim()
  const errors = validateEditForm(title, editDate, editTime)
  setEditErrors(errors)

  if (Object.keys(errors).length > 0) {
    setToastMessage("Please fix the highlighted fields")
    return
  }

  setDeadlines((prev) =>
    prev.map((d) =>
      d.id === editing.id ? { ...d, title, date: editDate, time: editTime } : d
    )
  )

  try {
    const res = await fetch(`${API_BASE}/events/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        event_date: editDate,
        event_time: editTime,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data?.detail || `Update failed: ${res.status}`)
    }

    setToastMessage("Event updated successfully")
    setEditErrors({})
    setEditOpen(false)
    setEditing(null)
    await loadEvents()
  } catch (err: any) {
    console.error(err)
    setToastMessage(err?.message || "Update failed")
    await loadEvents()
  }
  }, [editing, editTitle, editDate, editTime, loadEvents])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const handleDayClick = useCallback(
    (day: Date, _modifiers: any, e: any) => {
      setSelectedDate(day)
      setActiveDay(day)

      const key = dateKey(day)
      if (!markedKeys.has(key)) {
        setEventPopupOpen(false)
        return
      }

      const wrap = calendarWrapRef.current
      const cell = e?.currentTarget as HTMLElement | undefined

      if (wrap && cell?.getBoundingClientRect) {
        const wrapRect = wrap.getBoundingClientRect()
        const cellRect = cell.getBoundingClientRect()
        const x = cellRect.left - wrapRect.left + cellRect.width / 2
        const y = cellRect.top - wrapRect.top + cellRect.height
        setAnchorPos({
          x: Math.max(8, Math.min(x, wrapRect.width - 8)),
          y: Math.max(8, Math.min(y, wrapRect.height - 8)),
        })
      } else {
        setAnchorPos({ x: 12, y: 12 })
      }

      setTimeout(() => setEventPopupOpen(true), 0)
    },
    [markedKeys]
  )

  const monthValue = String(month.getMonth())
  const yearValue = String(month.getFullYear())

  return (
    <div className="flex flex-col gap-4">
      {(loading || loadError) && (
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
          {loading ? "Loading events from database..." : <span className="text-red-500">{loadError}</span>}
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-lg bg-foreground px-4 py-3 shadow-lg">
            <CalendarCheck className="w-5 h-5 text-background" />
            <p className="text-sm font-medium text-background">{toastMessage}</p>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Edit Event</p>
              <button
                onClick={() => {
                  setEditOpen(false)
                  setEditing(null)
                }}
                className="p-2 rounded hover:bg-muted/50 text-muted-foreground"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value)
                    setEditErrors((prev) => ({ ...prev, title: undefined }))
                  }}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                    editErrors.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-border bg-background focus:ring-orange-500"
                  }`}
                  placeholder="Event title"
                />
                {editErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{editErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => {
                      setEditDate(e.target.value)
                      setEditErrors((prev) => ({ ...prev, date: undefined }))
                    }}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                      editErrors.date
                        ? "border-red-500 focus:ring-red-500"
                        : "border-border bg-background focus:ring-orange-500"
                    }`}
                  />
                  {editErrors.date && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => {
                      setEditTime(e.target.value as HHMM)
                      setEditErrors((prev) => ({ ...prev, time: undefined }))
                    }}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                      editErrors.time
                        ? "border-red-500 focus:ring-red-500"
                        : "border-border bg-background focus:ring-orange-500"
                    }`}
                  />
                  {editErrors.time && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.time}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false)
                  setEditing(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[hsl(var(--accent))]" />
              <CardTitle className="text-lg font-semibold text-foreground">Calendar</CardTitle>
            </div>

            <Badge variant="secondary" className="text-xs">
              {activeDay ? formatDisplayDateFromDate(activeDay) : "Click a dotted date"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div
            ref={calendarWrapRef}
            className="relative w-fit rounded-xl border border-border bg-background p-2 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Select value={monthValue} onValueChange={(v) => setMonth(new Date(month.getFullYear(), Number(v), 1))}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((name, idx) => (
                      <SelectItem key={name} value={String(idx)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={yearValue} onValueChange={(v) => setMonth(new Date(Number(v), month.getMonth(), 1))}>
                  <SelectTrigger className="h-8 w-[110px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((yy) => (
                      <SelectItem key={yy} value={String(yy)}>
                        {yy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setMonth(new Date())}>
                Today
              </Button>
            </div>

            <Popover open={eventPopupOpen} onOpenChange={setEventPopupOpen}>
              <div className="absolute z-10" style={{ left: anchorPos.x, top: anchorPos.y }}>
                <PopoverTrigger asChild>
                  <button type="button" aria-label="Open events popup" className="h-2 w-2 opacity-0" />
                </PopoverTrigger>
              </div>

              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDate}
                onSelect={(d) => {
                  if (!d) return
                  setSelectedDate(d)
                  setActiveDay(d)

                  const key = dateKey(d)
                  if (!markedKeys.has(key)) {
                    setEventPopupOpen(false)
                    return
                  }
                  setTimeout(() => setEventPopupOpen(true), 0)
                }}
                onDayClick={handleDayClick as any}
                classNames={{ caption: "hidden", nav: "hidden" }}
                modifiers={{ hasEvents: markedDates }}
                modifiersClassNames={{
                  hasEvents:
                    "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-red-500",
                }}
              />

              <PopoverContent className="w-80 p-3" align="start" side="right" sideOffset={12}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {activeDay ? formatDisplayDateFromDate(activeDay) : "Selected day"}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {activeEvents.length} event{activeEvents.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-col gap-2 max-h-56 overflow-auto pr-1">
                  {activeEvents.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center">
                      <p className="text-sm font-medium text-foreground">No events</p>
                      <p className="text-xs text-muted-foreground mt-1">Click a dotted date.</p>
                    </div>
                  ) : (
                    activeEvents.map((ev) => (
                      <div key={ev.id} className="rounded-lg border border-border px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{ev.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(ev.time)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Reminders */}
      {urgentReminders.length > 0 && (
        <Card className="border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[hsl(var(--danger))]" />
              <CardTitle className="text-base font-semibold text-[hsl(var(--danger))]">
                Upcoming Reminders
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex flex-col gap-2">
              {urgentReminders.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
                    d.daysUntil <= 3
                      ? "bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20"
                      : "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 flex-shrink-0 ${
                        d.daysUntil <= 3 ? "text-[hsl(var(--danger))]" : "text-[hsl(var(--warning))]"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCountdown(d.daysUntil)} - {formatDisplayDate(d.date)} • {formatTime(d.time)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissReminder(d.id)}
                    className="p-1 rounded hover:bg-muted/50 text-muted-foreground"
                    aria-label="Dismiss reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Deadlines */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[hsl(var(--accent))]" />
            <CardTitle className="text-lg font-semibold text-foreground">Extracted Deadlines</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3">
            {deadlines.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{d.title}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatDisplayDate(d.date)}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(d.time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditOpen(d)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  {synced.has(d.id) ? (
                    <Button size="sm" variant="ghost" className="text-[hsl(var(--success))]" onClick={() => handleUnsync(d.id)}>
                      <Check className="w-4 h-4 mr-1" />
                      Synced
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleSync(d.id)}>
                      <CalendarDays className="w-4 h-4 mr-1" />
                      Sync
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-[hsl(var(--danger))]"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>

                        <AlertDialogDescription asChild>
                          <div className="space-y-2">                       
                            <span style={{ color: "black" }}> Are you sure you want to delete:</span>

                            <div className="rounded-md bg-muted px-3 py-2 text-sm font-medium">
                            {d.title}
                            </div> 
                          </div>

                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(d.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Synced Panel */}
      {syncedDeadlines.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[hsl(var(--success))]" />
                <CardTitle className="text-lg font-semibold text-foreground">Synced to Google Calendar</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {syncedDeadlines.length} event{syncedDeadlines.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3">
              {syncedDeadlines.map((d) => {
                const daysUntil = getDaysUntil(d.date)
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--success))]/10 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-5 h-5 text-[hsl(var(--success))]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatDisplayDate(d.date)}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatTime(d.time)}</span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span
                              className={`text-xs font-medium ${
                                daysUntil <= 3
                                  ? "text-[hsl(var(--danger))]"
                                  : daysUntil <= 7
                                    ? "text-[hsl(var(--warning))]"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {formatCountdown(daysUntil)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-[hsl(var(--danger))]" onClick={() => handleUnsync(d.id)}>
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Remove from calendar</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}