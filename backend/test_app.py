from app import _coerce_time_hhmm, _coerce_date_iso, _strip_json_fences

def test_coerce_time_from_short_format():
    assert _coerce_time_hhmm("9:05", "09:00") == "09:05"

def test_coerce_time_invalid_returns_default():
    assert _coerce_time_hhmm("abc", "09:00") == "09:00"

def test_coerce_date_valid():
    assert _coerce_date_iso("2026-05-15") == "2026-05-15"

def test_coerce_date_invalid():
    assert _coerce_date_iso("15/05/2026") is None

def test_strip_json_fences():
    raw = """```json
    {"events":[{"title":"Test","date":"2026-05-15","time":"09:00"}]}
    ```"""
    cleaned = _strip_json_fences(raw)
    assert cleaned.startswith("{")
    assert cleaned.endswith("}")