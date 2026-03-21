import os
import re
import json
from typing import List, Optional
from google import genai

import mysql.connector
from dotenv import load_dotenv

# ✅ Load .env values
load_dotenv()

# -------------------------
# 1) TXT -> TEXT
# -------------------------
def read_text_file(txt_path: str) -> str:
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


# -------------------------
# 2) Helpers
# -------------------------
ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HHMM_RE = re.compile(r"^\d{2}:\d{2}$")

def _coerce_time_hhmm(t: Optional[str], default_time: str) -> str:
    t = (t or "").strip()
    if re.match(r"^\d{1,2}:\d{2}$", t):
        h, m = t.split(":")
        return f"{int(h):02d}:{int(m):02d}"
    if HHMM_RE.match(t):
        return t
    return default_time

def _coerce_date_iso(d: Optional[str]) -> Optional[str]:
    d = (d or "").strip()
    return d if ISO_DATE_RE.match(d) else None

def _strip_json_fences(s: str) -> str:
    s = s.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\s*```$", "", s)
    return s.strip()


# -------------------------
# 3) Gemini Extractor
# -------------------------
def extract_events_with_gemini(
    text: str,
    default_time: str = "09:00",
    model: str = "gemini-2.5-flash",
) -> List[dict]:

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in .env")

    client = genai.Client(
        api_key=api_key,
        http_options={"api_version": "v1"},
    )

    text = text[:12000]

    prompt = f"""
Return ONLY valid JSON. Do NOT use markdown. Do NOT wrap in ```.

Output format must be EXACTLY one of these:

Option A:
{{"events":[{{"title":"...","date":"YYYY-MM-DD","time":"HH:MM"}}]}}

Option B:
[{{"title":"...","date":"YYYY-MM-DD","time":"HH:MM"}}]

Rules:
- Extract explicit or strongly implied deadlines, due dates, renewals, expiries, meetings, appointments, hearings, follow-ups, admissions, tests.
- Only include events with real dates.
- If time missing, use "{default_time}".
- date must be YYYY-MM-DD
- time must be HH:MM (24-hour)

DOCUMENT:
{text}
""".strip()

    response = client.models.generate_content(model=model, contents=prompt)

    raw = _strip_json_fences(response.text)

    try:
        data = json.loads(raw)
    except Exception:
        print("⚠ Model did not return valid JSON.")
        print("Raw response:\n", response.text)
        return []

    if isinstance(data, list):
        events_raw = data
    else:
        events_raw = data.get("events", [])

    cleaned: List[dict] = []
    seen = set()

    for ev in events_raw:
        if not isinstance(ev, dict):
            continue

        iso_date = _coerce_date_iso(ev.get("date"))
        if not iso_date:
            continue

        hhmm = _coerce_time_hhmm(ev.get("time"), default_time)
        title = (ev.get("title") or "").strip() or "Important Deadline"

        key = (title.lower().strip(), iso_date, hhmm)
        if key in seen:
            continue
        seen.add(key)

        cleaned.append({"title": title, "date": iso_date, "time": hhmm})

    return cleaned


# -------------------------
# 4) MySQL Connection + Save
# -------------------------
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASS", ""),
        database=os.getenv("DB_NAME", "amitdb"),
    )

def test_db_connection():
    conn = get_db_connection()
    try:
        if conn.is_connected():
            cur = conn.cursor()
            cur.execute("SELECT DATABASE();")
            db = cur.fetchone()[0]
            print(f"✅ MySQL connected! Database: {db}")
            cur.close()
    finally:
        conn.close()

def save_events_to_db(events):
    if not events:
        print("⚠ No events to save into DB.")
        return

    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # Use INSERT IGNORE if you added UNIQUE(title,event_date,event_time)
        sql = """
        INSERT IGNORE INTO Events (title, event_date, event_time, status, google_event_id, ocr_text_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        for e in events:
            cur.execute(sql, (e["title"], e["date"], e["time"], "draft", None, None))

        conn.commit()
        print(f"✅ Saved {len(events)} events into MySQL.")

        cur.close()
    finally:
        conn.close()


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    # 1) Test DB connection first
    test_db_connection()

    # 2) Extract events
    text_file = "data/input.txt"
    ocr_text = read_text_file(text_file)
    event_list = extract_events_with_gemini(ocr_text, default_time="09:00")

    # 3) Print events
    print("\n📅 Structured Events Ready for Calendar Sync:\n")
    for event in event_list:
        print(f"Title: {event['title']}")
        print(f"Date: {event['date']}")
        print(f"Time: {event['time']}")
        print()

    # 4) Save to MySQL
    save_events_to_db(event_list)