import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ---------------------------------------------------------------------------
# Health & Root
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert "version" in body


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert "TransitERA" in response.json()["message"]


# ---------------------------------------------------------------------------
# Stations
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_stations(client):
    response = await client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) == 5
    ids = [s["id"] for s in stations]
    for expected in ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]:
        assert expected in ids


@pytest.mark.asyncio
async def test_get_tod_score_valid(client):
    response = await client.get("/api/tod-score/gubeng")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "gubeng"
    assert 80.0 <= data["tod_readiness_score"] <= 90.0
    assert "scores" in data
    assert data["scores"]["density"] == 88.0
    assert "policy_recommendations" in data
    assert len(data["policy_recommendations"]) > 0


@pytest.mark.asyncio
async def test_get_tod_score_invalid_station(client):
    response = await client.get("/api/tod-score/invalid_xyz")
    assert response.status_code == 422  # Pydantic enum validation error


@pytest.mark.asyncio
async def test_get_tod_score_all_stations(client):
    """Semua 5 stasiun harus mengembalikan skor yang valid (0-100)."""
    for station_id in ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]:
        response = await client.get(f"/api/tod-score/{station_id}")
        assert response.status_code == 200, f"Failed for station: {station_id}"
        data = response.json()
        assert 0 <= data["tod_readiness_score"] <= 100


# ---------------------------------------------------------------------------
# H3 Grid
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_h3_grid_all(client):
    response = await client.get("/api/h3-grid")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0
    # Verify geometry type
    assert data["features"][0]["geometry"]["type"] == "Polygon"
    # Verify required properties
    props = data["features"][0]["properties"]
    assert "tod_readiness_score" in props
    assert "station_cluster" in props


@pytest.mark.asyncio
async def test_get_h3_grid_filtered_by_station(client):
    response = await client.get("/api/h3-grid?station=gubeng")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) > 0
    for f in data["features"]:
        assert f["properties"]["station_cluster"] == "gubeng"


@pytest.mark.asyncio
async def test_get_h3_grid_filtered_by_min_score(client):
    response = await client.get("/api/h3-grid?min_score=80")
    assert response.status_code == 200
    data = response.json()
    for f in data["features"]:
        assert f["properties"]["tod_readiness_score"] >= 80


# ---------------------------------------------------------------------------
# NJOP Premium
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_njop_premium(client):
    response = await client.get("/api/njop-premium/waru")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "waru"
    assert data["avg_njop_premium_pct"] == 8.2
    assert data["ci_lower_pct"] < data["avg_njop_premium_pct"] < data["ci_upper_pct"]
    assert 0 <= data["r_squared"] <= 1


@pytest.mark.asyncio
async def test_njop_ci_valid_for_all_stations(client):
    """CI lower < avg < CI upper untuk semua stasiun."""
    for station_id in ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]:
        response = await client.get(f"/api/njop-premium/{station_id}")
        assert response.status_code == 200
        d = response.json()
        assert d["ci_lower_pct"] < d["avg_njop_premium_pct"] < d["ci_upper_pct"], \
            f"CI sanity check failed for {station_id}"


# ---------------------------------------------------------------------------
# Dynamic Spatial Analytics (AHP, SDM, Typology)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_analytics_ahp_calculation(client):
    payload = {
        "scores": {
            "density": 85.0,
            "diversity": 90.0,
            "design": 75.0,
            "destination_accessibility": 88.0,
            "distance_to_transit": 92.0
        }
    }
    response = await client.post("/api/analytics/ahp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 80.0 <= data["tod_readiness_score"] <= 95.0
    assert data["is_consistent"] is True
    assert data["consistency_ratio"] <= 0.10
    assert "weights" in data
    assert len(data["weights"]) == 5
    assert len(data["policy_recommendations"]) > 0


@pytest.mark.asyncio
async def test_analytics_sdm_estimate(client):
    payload = {
        "tod_score": 82.5,
        "distance_to_station_m": 300.0
    }
    response = await client.post("/api/analytics/sdm-estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_njop_premium_pct"] > 0
    assert data["direct_effect_pct"] > 0
    assert data["spillover_effect_pct"] > 0
    assert data["ci_lower_pct"] < data["predicted_njop_premium_pct"] < data["ci_upper_pct"]
    assert data["r_squared"] == 0.76


@pytest.mark.asyncio
async def test_analytics_typology_classification(client):
    payload = {
        "scores": {
            "density": 88.0,
            "diversity": 85.0,
            "design": 80.0,
            "destination_accessibility": 90.0,
            "distance_to_transit": 85.0
        },
        "tod_readiness_score": 85.5
    }
    response = await client.post("/api/analytics/typology", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["typology"] == "Commercial Transit Hub"
    assert data["confidence"] > 0.8
    assert "zoning_advice" in data


# ---------------------------------------------------------------------------
# Survey Points
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_survey_points(client):
    response = await client.get("/api/survey-points")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0


@pytest.mark.asyncio
async def test_survey_points_filter_by_type(client):
    response = await client.get("/api/survey-points?survey_type=mission")
    assert response.status_code == 200
    data = response.json()
    for f in data["features"]:
        assert f["properties"]["survey_type"] == "mission"


# ---------------------------------------------------------------------------
# Scenario Simulation
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_simulate_feeder_extension(client):
    payload = {
        "scenario_id": "test_feeder_001",
        "target_station": "waru",
        "intervention_type": "feeder_extension"
    }
    response = await client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_station"] == "waru"
    assert data["delta_tod_score"] > 0
    assert data["simulated_tod_score"] > data["baseline_tod_score"]
    assert "summary_narrative" in data


@pytest.mark.asyncio
async def test_simulate_pedestrian_upgrade(client):
    payload = {
        "scenario_id": "test_ped_001",
        "target_station": "wonokromo",
        "intervention_type": "pedestrian_upgrade"
    }
    response = await client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["delta_tod_score"] > 0


@pytest.mark.asyncio
async def test_simulate_invalid_station(client):
    payload = {
        "scenario_id": "test_bad_001",
        "target_station": "invalid_xyz",
        "intervention_type": "feeder_extension"
    }
    response = await client.post("/api/simulate", json=payload)
    assert response.status_code == 422  # Enum validation


# ---------------------------------------------------------------------------
# Spatial Map Layers Endpoints
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_transit_nodes_layer(client):
    response = await client.get("/api/layers/transit-nodes")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 125  # 125 halte bus/feeder


@pytest.mark.asyncio
async def test_get_flood_hazard_layer(client):
    response = await client.get("/api/layers/flood-hazard")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 1000  # 1.553 zona banjir


@pytest.mark.asyncio
async def test_get_nighttime_light_layer(client):
    response = await client.get("/api/layers/nighttime-light")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 52  # 52 zona NTL


@pytest.mark.asyncio
async def test_get_stations_layer(client):
    response = await client.get("/api/layers/stations")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 17  # 17 stasiun Surabaya


@pytest.mark.asyncio
async def test_get_transit_routes_layer(client):
    response = await client.get("/api/layers/transit-routes")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 16


@pytest.mark.asyncio
async def test_get_intermodal_routes(client):
    response = await client.get("/api/transit/intermodal-routes/gubeng")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "gubeng"
    assert len(data["plans"]) >= 2
    assert "steps" in data["plans"][0]


@pytest.mark.asyncio
async def test_get_gistaru_layer(client):
    response = await client.get("/api/layers/gistaru")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0


@pytest.mark.asyncio
async def test_get_bhumi_layer(client):
    response = await client.get("/api/layers/bhumi")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 500

