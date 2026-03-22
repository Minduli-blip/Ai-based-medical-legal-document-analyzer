import os
import datetime
import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "amitdb"),
    )

def format_time(t):
    if t is None:
        return ""

    if isinstance(t, datetime.timedelta):
        total_seconds = int(t.total_seconds())
        hh = (total_seconds // 3600) % 24
        mm = (total_seconds % 3600) // 60
        return f"{hh:02d}:{mm:02d}"

    if isinstance(t, (int, float)):
        total_seconds = int(t)
        hh = (total_seconds // 3600) % 24
        mm = (total_seconds % 3600) // 60
        return f"{hh:02d}:{mm:02d}"

    if isinstance(t, datetime.time):
        return t.strftime("%H:%M")

    s = str(t)
    return s[:5] if len(s) >= 5 else s


SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

def get_calendar_service():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    token_path = os.path.join(base_dir, "token.json")

    if not os.path.exists(token_path):
        raise HTTPException(status_code=500, detail="token.json not found. Run OAuth login first.")

    creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    return build("calendar", "v3", credentials=creds)

def build_event_body(title: str, event_date: str, hhmm: str):
    if not hhmm:
        hhmm = "09:00"

    start_dt = f"{event_date}T{hhmm}:00"
    end_time = (
        datetime.datetime.strptime(hhmm, "%H:%M") + datetime.timedelta(minutes=30)
    ).strftime("%H:%M")
    end_dt = f"{event_date}T{end_time}:00"

    return {
        "summary": title,
        "start": {"dateTime": start_dt, "timeZone": "Asia/Colombo"},
        "end": {"dateTime": end_dt, "timeZone": "Asia/Colombo"},
    }


class StatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str):
        allowed = {"draft", "synced", "pending", "cancelled"}
        value = v.strip().lower()
        if value not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(sorted(allowed))}")
        return value


class EventUpdate(BaseModel):
    title: str
    event_date: str
    event_time: str
    status: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str):
        value = v.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        if len(value) < 3:
            raise ValueError("Title must be at least 3 characters long")
        if len(value) > 150:
            raise ValueError("Title must be less than 150 characters")
        return value

    @field_validator("event_date")
    @classmethod
    def validate_event_date(cls, v: str):
        try:
            parsed = datetime.date.fromisoformat(v)
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

        today = datetime.date.today()
        if parsed < today:
            raise ValueError("Event date cannot be in the past")
        return v

    @field_validator("event_time")
    @classmethod
    def validate_event_time(cls, v: str):
        try:
            datetime.datetime.strptime(v, "%H:%M")
        except ValueError:
            raise ValueError("Time must be in HH:MM 24-hour format")
        return v


def event_exists(cur, title: str, event_date: str, event_time: str, exclude_id: int | None = None):
    if exclude_id is not None:
        cur.execute(
            """
            SELECT event_id FROM Events
            WHERE title=%s AND event_date=%s AND event_time=%s AND event_id != %s
            LIMIT 1
            """,
            (title, event_date, event_time, exclude_id),
        )
    else:
        cur.execute(
            """
            SELECT event_id FROM Events
            WHERE title=%s AND event_date=%s AND event_time=%s
            LIMIT 1
            """,
            (title, event_date, event_time),
        )
    return cur.fetchone() is not None


@app.get("/events")
def list_events():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            """
            SELECT event_id, title, event_date, event_time, status, google_event_id
            FROM Events
            ORDER BY event_date, event_time
            """
        )
        rows = cur.fetchall()

        for r in rows:
            if r.get("event_date"):
                if hasattr(r["event_date"], "isoformat"):
                    r["event_date"] = r["event_date"].isoformat()
                else:
                    r["event_date"] = str(r["event_date"])[:10]

            r["event_time"] = format_time(r.get("event_time"))

        return rows
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {e}")
    finally:
        cur.close()
        conn.close()


@app.put("/events/{event_id}/status")
def update_status(event_id: int, body: StatusUpdate):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT event_id FROM Events WHERE event_id=%s", (event_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Event not found")

        cur.execute("UPDATE Events SET status=%s WHERE event_id=%s", (body.status, event_id))
        conn.commit()
        return {"ok": True, "event_id": event_id, "new_status": body.status}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {e}")
    finally:
        cur.close()
        conn.close()


@app.post("/events/{event_id}/sync")
def sync_event_to_google(event_id: int):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            """
            SELECT event_id, title, event_date, event_time, google_event_id
            FROM Events
            WHERE event_id=%s
            """,
            (event_id,),
        )
        ev = cur.fetchone()

        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")

        title = ev["title"]
        date_str = ev["event_date"].isoformat() if ev["event_date"] else None
        time_hhmm = format_time(ev["event_time"]) or "09:00"
        google_event_id = ev.get("google_event_id")

        if ev["event_date"] and ev["event_date"] < datetime.date.today():
            raise HTTPException(
                status_code=400,
                detail="Cannot sync past events"
            )

        service = get_calendar_service()
        body = build_event_body(title, date_str, time_hhmm)

        if google_event_id:
            updated = service.events().patch(
                calendarId="primary",
                eventId=google_event_id,
                body=body
            ).execute()
            g_id = updated["id"]
        else:
            created = service.events().insert(
                calendarId="primary",
                body=body
            ).execute()
            g_id = created["id"]

        cur2 = conn.cursor()
        cur2.execute(
            """
            UPDATE Events
            SET google_event_id=%s, status='synced'
            WHERE event_id=%s
            """,
            (g_id, event_id),
        )
        conn.commit()
        cur2.close()

        return {
            "ok": True,
            "event_id": event_id,
            "google_event_id": g_id,
            "status": "synced",
        }

    except HttpError as e:
        raise HTTPException(status_code=500, detail=f"Google Calendar API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {repr(e)}")
    finally:
        cur.close()
        conn.close()


@app.post("/events/{event_id}/unsync")
def unsync_event(event_id: int):
    """
    Remove event from Google Calendar and mark as unsynced in DB.
    """
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("SELECT google_event_id FROM Events WHERE event_id=%s", (event_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Event not found")

        google_event_id = row.get("google_event_id")

        if google_event_id:
            try:
                service = get_calendar_service()
                service.events().delete(calendarId="primary", eventId=google_event_id).execute()
            except HttpError:
                pass

        cur2 = conn.cursor()
        cur2.execute("""
            UPDATE Events
            SET google_event_id=NULL, status='draft'
            WHERE event_id=%s
        """, (event_id,))
        conn.commit()
        cur2.close()

        return {
            "ok": True,
            "event_id": event_id,
            "unsynced": True
        }

    finally:
        cur.close()
        conn.close()


@app.put("/events/{event_id}")
def update_event(event_id: int, body: EventUpdate):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT event_id, google_event_id FROM Events WHERE event_id=%s",
            (event_id,),
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Event not found")

        if event_exists(cur, body.title, body.event_date, body.event_time, exclude_id=event_id):
            raise HTTPException(
                status_code=400,
                detail="An event with the same title, date, and time already exists"
            )

        google_event_id = row.get("google_event_id")

        cur2 = conn.cursor()
        cur2.execute(
            """
            UPDATE Events
            SET title=%s, event_date=%s, event_time=%s
            WHERE event_id=%s
            """,
            (body.title, body.event_date, body.event_time, event_id),
        )
        conn.commit()
        cur2.close()

        if google_event_id:
            service = get_calendar_service()
            g_body = build_event_body(body.title, body.event_date, body.event_time)
            service.events().patch(
                calendarId="primary",
                eventId=google_event_id,
                body=g_body
            ).execute()

        return {
            "ok": True,
            "event_id": event_id,
            "updated": True,
            "synced_updated": bool(google_event_id),
        }

    except HttpError as e:
        raise HTTPException(status_code=500, detail=f"Google update failed: {e}")
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {e}")
    finally:
        cur.close()
        conn.close()


@app.delete("/events/{event_id}")
def delete_event(event_id: int):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("SELECT google_event_id FROM Events WHERE event_id=%s", (event_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Event not found")

        google_event_id = row.get("google_event_id")

        if google_event_id:
            try:
                service = get_calendar_service()
                service.events().delete(calendarId="primary", eventId=google_event_id).execute()
            except HttpError:
                pass

        cur2 = conn.cursor()
        cur2.execute("DELETE FROM Events WHERE event_id=%s", (event_id,))
        conn.commit()
        cur2.close()

        return {
            "ok": True,
            "deleted": True,
            "event_id": event_id,
            "google_deleted": bool(google_event_id),
        }

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database delete failed: {e}")
    finally:
        cur.close()
        conn.close()