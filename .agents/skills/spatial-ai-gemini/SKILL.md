---
name: spatial-ai-gemini
description: Standardized development guide for building the User-Facing Spatial AI Assistant in TransitERA WebGIS using Google Gemini API Function Calling, FastAPI proxy backend, structured dual-outputs, 4 AI patterns (Function Router, Query Filter, Dynamic Web Scraper, Parameter Builder), token optimization, and RAG over survey narratives.
---

# Spatial AI Gemini Assistant Guide (TransitERA)

Technical implementation guide for the **Spatial AI Assistant** powered by **Google Gemini API** in **TransitERA WebGIS**, aligned with competition coaching standards.

---

## 1. Architectural Blueprint & Jury Expectations

```
+------------------------------------------------------------------------+
|                         FRONTEND (Next.js 16)                          |
|  - Natural language input / Curated Quick Action Chips                 |
|  - Render Chat Bubble (text_response)                                  |
|  - Execute MapLibre Actions (json_response: filter, zoom, highlight)  |
+-----------------------------------+------------------------------------+
                                    | HTTPS POST /api/ai/query
                                    v
+------------------------------------------------------------------------+
|                        BACKEND (FastAPI Proxy)                         |
|  - Ingest prompt & user viewport context (bbox, active layers)         |
|  - Call Gemini API via JSON Function Calling (Strict Pydantic Schema)  |
|  - Execute local PostGIS / Uber H3 query builder                       |
|  - Synthesize dual-output: text_response + json_response               |
+-------------------+-------------------------------+--------------------+
                    |                               |
                    v                               v
    +-------------------------------+   +-----------------------+
    | Google Gemini API (Free Tier) |   | PostgreSQL + PostGIS  |
    | - Intent classification       |   | - Uber H3 Hex Grid    |
    | - Parameter extraction        |   | - TOD Scores (AHP 5D) |
    | - Function name routing       |   | - Survey Activity RAG |
    +-------------------------------+   +-----------------------+
```

### Mandatory Architectural Rules:
1. **Interactive User-Facing Spatial AI**: The AI must directly manipulate the live MapLibre viewport (highlighting stations, filtering choropleth layers, rendering radar charts).
2. **API Key Isolation**: `GEMINI_API_KEY` resides strictly in backend `.env`; client-side code never contacts Google Gemini API directly.
3. **Dual-Output Invariant**: Every AI response must provide structured JSON for map control and markdown text for human narrative:
   $$\text{AI Response} = \{\text{data}: \{\text{action}, \text{view\_state}, \text{filter\_query}, \dots\}, \text{text\_response}: \text{str}\}$$
4. **Parameter Builder, Not Geometry Calculator**: AI extracts high-level intent (station name, buffer radius, filter criteria). Coordinate transformations and spatial operations are performed deterministically by PostGIS / Turf.js.
5. **Token Optimization**: Never inject raw, massive GeoJSON polygons into the LLM prompt. Supply compact tabular summaries and let Gemini return database query parameters.

---

## 2. The 4 Spatial AI Patterns

1. **Pattern 1: Function Router**: Natural language shortcuts mapping directly to deterministic spatial endpoints (e.g., *"Show TOD score for Gubeng"* $\rightarrow$ `get_tod_score(station="gubeng")`).
2. **Pattern 2: Query Filter**: Translates user search criteria into structured database query arguments (e.g., *"Show crowded food stalls near stations"* $\rightarrow$ `{"category": "culinary", "density": "high"}`).
3. **Pattern 3: External Dynamic Context Enrichment**: Augments local spatial records with live external knowledge with strict coordinate guardrails.
4. **Pattern 4: Geometric Parameter Builder**: Extracts core coordinate and dimensional parameters for client-side drawing and buffer generation.

---

## 3. Strict JSON Function Calling Schema (FastAPI)

```python
SPATIAL_TOOLS = [
    {
        "name": "get_tod_score",
        "description": "Retrieve 5D TOD readiness score and typology for an SRRL transit station node in Surabaya.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"],
                    "description": "Unique transit station identifier."
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "compare_stations",
        "description": "Compare 5D TOD scores and radar chart benchmarks between two transit stations.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_a": {"type": "string", "enum": ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]},
                "station_b": {"type": "string", "enum": ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]}
            },
            "required": ["station_a", "station_b"]
        }
    },
    {
        "name": "get_njop_premium",
        "description": "Retrieve Spatial Durbin Model (SDM) land value appreciation estimates (%ΔNJOP) surrounding a transit hub.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {"type": "string", "enum": ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"]}
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "filter_layer",
        "description": "Filter active MapLibre layers by thematic criteria (TOD score range, crowdsourced survey tags).",
        "parameters": {
            "type": "object",
            "properties": {
                "target_layer": {
                    "type": "string",
                    "enum": ["h3_tod_score", "h3_njop_premium", "survey_activity", "survey_mission"]
                },
                "criteria": {"type": "object", "description": "Arbitrary filter dictionary."}
            },
            "required": ["target_layer", "criteria"]
        }
    },
    {
        "name": "simulate_scenario",
        "description": "Simulate feeder expansion or pedestrian network interventions on TOD scores and land value appreciation.",
        "parameters": {
            "type": "object",
            "properties": {
                "scenario_id": {
                    "type": "string",
                    "enum": ["extend_feeder_waru", "add_feeder_semut", "dedicated_pedestrian_gubeng"]
                }
            },
            "required": ["scenario_id"]
        }
    }
]
```

---

## 4. Curated Prompt Presets (Minimum 7 Quick Action Chips)
1. "Tampilkan skor kesiapan TOD Stasiun Gubeng"
2. "Bandingkan skor TOD Wonokromo vs Pasar Turi"
3. "Dimensi TOD mana yang paling lemah di Stasiun Waru?"
4. "Berapa estimasi kenaikan nilai tanah (%ΔNJOP) di sekitar Stasiun Semut?"
5. "Tampilkan titik survei aktivitas warga di sekitar koridor stasiun"
6. "Simulasikan penambahan rute feeder WiraWiri di Stasiun Waru"
7. "Rekomendasikan lokasi terbaik untuk UMKM kuliner di koridor transit"
