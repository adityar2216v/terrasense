import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_create_and_get_incident():
    payload = {
        "category": "Air Quality",
        "title": "Test Incident",
        "description": "Test description",
        "severity": "HIGH",
        "source_type": "MANUAL",
        "latitude": 28.6,
        "longitude": 77.2
    }
    
    # Create
    create_resp = client.post("/api/incidents", json=payload)
    assert create_resp.status_code == 201
    data = create_resp.json()
    assert data["title"] == "Test Incident"
    incident_id = data["incident_id"]
    
    # Get
    get_resp = client.get(f"/api/incidents/{incident_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["incident_id"] == incident_id

def test_update_status():
    payload = {
        "category": "Air Quality",
        "title": "Test Incident 2",
        "description": "Test description 2",
        "severity": "LOW"
    }
    create_resp = client.post("/api/incidents", json=payload)
    incident_id = create_resp.json()["incident_id"]
    
    update_payload = {"status": "RESOLVED"}
    update_resp = client.patch(f"/api/incidents/{incident_id}/status", json=update_payload)
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "RESOLVED"
