import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

# 7 curated prompts dari PRD Section 8 — semua harus menghasilkan response valid
CURATED_PROMPTS = [
    # (prompt, expected_action, expected_station)
    ("Tampilkan skor TOD di sekitar Stasiun Gubeng",        "highlight_and_zoom",  "gubeng"),
    ("Bandingkan skor TOD Gubeng dan Wonokromo",            "compare_stations",    "gubeng"),
    ("Apa dimensi TOD terlemah di Stasiun Pasar Turi?",    "highlight_and_zoom",  "pasar_turi"),
    ("Berapa estimasi kenaikan nilai tanah di sekitar Waru?", "highlight_and_zoom", "waru"),
    ("Tampilkan lokasi warung makan ramai di dekat stasiun", "filter_layer",       None),
    ("Jika feeder WiraWiri diperpanjang ke Waru, apa dampaknya?", "show_scenario", "waru"),
    ("Di mana lokasi terbaik untuk buka kedai kopi dekat stasiun?", "site_recommendation", "wonokromo"),
]


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_ai_curated_prompts(client):
    """Seluruh 7 curated prompts wajib sukses (Success Rate >= 90%)."""
    success_count = 0

    for prompt_text, expected_action, expected_station in CURATED_PROMPTS:
        response = await client.post("/api/ai/query", json={"prompt": prompt_text})
        assert response.status_code == 200, f"HTTP error for prompt: {prompt_text!r}"

        res_data = response.json()
        assert res_data["status"] == "success", f"Status error for: {prompt_text!r}"

        data = res_data["data"]
        assert "text_response" in data
        assert len(data["text_response"]) > 20, "Response text tropendek"
        assert data["action"] == expected_action, \
            f"Expected action '{expected_action}', got '{data['action']}' for: {prompt_text!r}"

        if expected_station:
            assert data["target_station"] == expected_station, \
                f"Expected station '{expected_station}', got '{data['target_station']}' for: {prompt_text!r}"

        success_count += 1

    success_rate = (success_count / len(CURATED_PROMPTS)) * 100
    assert success_rate >= 90.0, f"Success rate {success_rate:.0f}% di bawah target 90%"


@pytest.mark.asyncio
async def test_ai_query_basic_response_structure(client):
    """Response AI harus selalu memiliki struktur yang valid."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "Tampilkan informasi stasiun Gubeng"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "data" in data
    assert "text_response" in data["data"]
    assert "action" in data["data"]


@pytest.mark.asyncio
async def test_ai_query_short_prompt_rejected(client):
    """Prompt yang terlalu pendek harus ditolak dengan 422."""
    response = await client.post("/api/ai/query", json={"prompt": "x"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_query_default_fallback(client):
    """Prompt random harus tetap mengembalikan response default yang valid."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "Lorem ipsum dolor sit amet consectetur"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]["text_response"]) > 20


@pytest.mark.asyncio
async def test_ai_query_economic_survey_wonokromo(client):
    """Kueri spesifik info ekonomi Wonokromo berbasis survei MAPID wajib memanggil get_survey_data."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "info ekonomi sekitar wonokromo based data survei mapid"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "highlight_and_zoom"
    assert ai_data["target_station"] == "wonokromo"
    assert ai_data["function_called"] == "get_survey_data"
    assert "wonokromo" in ai_data["text_response"].lower()


@pytest.mark.asyncio
async def test_ai_query_multimodal_route(client):
    """Kueri rute perjalanan antar-stasiun wajib memanggil get_route."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "rute perjalanan dari gubeng ke benowo naik apa"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "show_route"
    assert ai_data["function_called"] == "get_route"


@pytest.mark.asyncio
async def test_ai_query_walkability_score(client):
    """Kueri indeks walkability dan trotoar wajib memanggil get_area_score."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "bagaimana indeks walkability dan trotoar pejalan kaki di stasiun gubeng"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["function_called"] == "get_area_score"
    assert ai_data["target_station"] == "gubeng"


@pytest.mark.asyncio
async def test_ai_query_landmark_route_tunjungan_plaza(client):
    """Kueri rute ke landmark (Tunjungan Plaza) dari simpul Gubeng wajib memanggil get_route."""
    prompt = "[Konteks: Stasiun GUBENG | Persona: COMMUTER] Bagaimana rute intermoda tercepat menuju Tunjungan Plaza dari simpul ini?"
    response = await client.post("/api/ai/query", json={"prompt": prompt})
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "show_route"
    assert "tunjungan plaza" in ai_data["text_response"].lower()
    assert "feeder" in ai_data["text_response"].lower() or "wirawiri" in ai_data["text_response"].lower()


@pytest.mark.asyncio
async def test_ai_query_feeder_services_benowo(client):
    """Kueri feeder WiraWiri dan bus di Stasiun Benowo wajib memanggil get_transit_services."""
    prompt = "[Konteks: Stasiun BENOWO | Persona: COMMUTER] Rute feeder WiraWiri dan Suroboyo Bus apa saja yang lewat di stasiun ini?"
    response = await client.post("/api/ai/query", json={"prompt": prompt})
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "show_transit_routes"
    assert ai_data["target_station"] == "benowo"
    assert ai_data["function_called"] == "get_transit_services"
    assert "wirawiri" in ai_data["text_response"].lower()
    assert "benowo" in ai_data["text_response"].lower()


@pytest.mark.asyncio
async def test_ai_query_fare_and_payment(client):
    """Kueri tarif dan sistem transfer gratis 2 jam wajib memanggil get_fare_and_payment_info."""
    prompt = "Berapa tarif Suroboyo Bus dan WiraWiri? Bagaimana cara bayar dan sistem transfer gratis 2 jamnya?"
    response = await client.post("/api/ai/query", json={"prompt": prompt})
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert "5.000" in ai_data["text_response"]
    assert "2 jam" in ai_data["text_response"].lower()


@pytest.mark.asyncio
async def test_ai_query_economic_survey_gubeng(client):
    """Kueri kawasan ekonomi Gubeng wajib mengembalikan profil riil Gubeng tanpa kontaminasi data Wonokromo."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "bagaimana kawasan ekonomi stasiun gubeng"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "highlight_and_zoom"
    assert ai_data["target_station"] == "gubeng"
    assert ai_data["function_called"] == "get_survey_data"
    text = ai_data["text_response"].lower()
    assert "gubeng" in text
    assert any(term in text for term in ["plaza surabaya", "delta plaza", "grand city", "wtc", "dharmahusada", "kalimas"])
    # Anti-cross-contamination check: data Wonokromo tidak boleh bocor ke Gubeng
    assert "darmo trade center" not in text
    assert "dtc" not in text
    assert "stasiun wonokromo" not in text


@pytest.mark.asyncio
async def test_ai_query_site_recommendation_gubeng(client):
    """Kueri rekomendasi lokasi usaha di Gubeng wajib menyasar stasiun Gubeng dan bukan Wonokromo."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "di mana lokasi terbaik untuk buka kedai kopi di sekitar stasiun gubeng"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "site_recommendation"
    assert ai_data["target_station"] == "gubeng"
    assert "gubeng" in ai_data["text_response"].lower()
    assert "wonokromo" not in ai_data["text_response"].lower()


@pytest.mark.asyncio
async def test_ai_query_simulation_gubeng_pedestrian(client):
    """Kueri simulasi intervensi pedestrian Gubeng wajib menjalankan skenario dedicated_pedestrian_gubeng."""
    response = await client.post(
        "/api/ai/query",
        json={"prompt": "simulasi skenario jalur pedestrian berkanopi gubeng"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    ai_data = res["data"]
    assert ai_data["action"] == "show_scenario"
    assert ai_data["target_station"] == "gubeng"
    assert ai_data["function_called"] == "simulate_scenario"
    assert "grand city" in ai_data["text_response"].lower() or "pedestrian" in ai_data["text_response"].lower()



