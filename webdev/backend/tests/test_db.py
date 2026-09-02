import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import is_db_connected, check_db_health
from app.db.models import Station, H3TodAnalytics

client = TestClient(app)

def test_database_health_check_structure():
    health = check_db_health()
    assert isinstance(health, dict)
    assert "status" in health
    assert "storage_mode" in health
    # Default without DATABASE_URL should be in_memory fallback
    assert health["storage_mode"] in ["in_memory", "postgis_live", "in_memory_fallback"]

def test_root_health_endpoint_includes_database_info():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "storage_mode" in data["database"]

def test_db_status_endpoint():
    response = client.get("/api/db/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "storage_mode" in data

def test_db_seed_endpoint_graceful_handling():
    response = client.post("/api/db/seed")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["skipped", "already_seeded", "success"]

def test_in_memory_fallback_for_stations_and_h3():
    # Stations endpoint works seamlessly regardless of DB state
    res_st = client.get("/api/stations")
    assert res_st.status_code == 200
    stations = res_st.json()
    assert len(stations) == 5

    # H3 grid endpoint works seamlessly
    res_h3 = client.get("/api/h3-grid?station=gubeng")
    assert res_h3.status_code == 200
    h3_fc = res_h3.json()
    assert h3_fc["type"] == "FeatureCollection"
    assert len(h3_fc["features"]) == 19
