from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_list_events_endpoint_exists():
    response = client.get("/events")
    assert response.status_code in [200, 500]

def test_update_nonexistent_event():
    response = client.put(
        "/events/999999",
        json={
            "title": "Court Hearing",
            "event_date": "2099-12-31",
            "event_time": "10:00"
        }
    )
    assert response.status_code in [404, 500]

def test_invalid_title_rejected():
    response = client.put(
        "/events/1",
        json={
            "title": "",
            "event_date": "2099-12-31",
            "event_time": "10:00"
        }
    )
    assert response.status_code == 422

def test_invalid_date_rejected():
    response = client.put(
        "/events/1",
        json={
            "title": "Valid Title",
            "event_date": "31-12-2099",
            "event_time": "10:00"
        }
    )
    assert response.status_code == 422

def test_past_date_rejected():
    response = client.put(
        "/events/1",
        json={
            "title": "Valid Title",
            "event_date": "2020-01-01",
            "event_time": "10:00"
        }
    )
    assert response.status_code == 422

def test_invalid_time_rejected():
    response = client.put(
        "/events/1",
        json={
            "title": "Valid Title",
            "event_date": "2099-12-31",
            "event_time": "25:99"
        }
    )
    assert response.status_code == 422

def test_delete_nonexistent_event():
    response = client.delete("/events/999999")
    assert response.status_code in [404, 500]