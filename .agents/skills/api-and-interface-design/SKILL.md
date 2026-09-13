---
name: api-and-interface-design
description: "Guides stable API and interface design for TransitERA WebGIS. Covers FastAPI REST endpoints (TOD Score, NJOP premium, spatial queries), Gemini AI proxy pattern, contract-first design, consistent error semantics, boundary validation, and predictable naming conventions."
---

# API and Interface Design (TransitERA)

API and interface design guidelines for **TransitERA WebGIS**, tailored for the **FastAPI + Next.js App Router + Google Gemini Proxy** stack.

---

## 1. Core Principles

### Contract First
Define interfaces and data schemas before implementation. The contract is the specification; implementation follows.

```python
# FastAPI: Define Pydantic schemas upfront
from pydantic import BaseModel, Field
from enum import Enum

class StationId(str, Enum):
    gubeng = "gubeng"
    pasar_turi = "pasar_turi"
    semut = "semut"
    wonokromo = "wonokromo"
    waru = "waru"

class TODScoreResponse(BaseModel):
    station_id: StationId
    station_name: str
    tod_readiness_score: float = Field(..., ge=0, le=100)
    density: float
    diversity: float
    design: float
    destination_accessibility: float
    distance_to_transit: float
    typology: str
    h3_indexes: list[str]

class NJOPPremiumResponse(BaseModel):
    station_id: StationId
    avg_njop_premium_pct: float
    ci_lower_pct: float
    ci_upper_pct: float
    affected_h3_count: int
```

### Consistent Error Semantics
Enforce a unified error response model across all endpoints:

```python
from fastapi import HTTPException
from pydantic import BaseModel

class APIError(BaseModel):
    code: str       # Machine-readable: "VALIDATION_ERROR"
    message: str    # Human-readable: "Invalid station ID"
    details: dict | None = None

# Status code mappings for TransitERA:
# 400 -> Invalid client payload
# 404 -> Station or H3 cell not found
# 422 -> Boundary validation failure (coordinates outside Surabaya bbox)
# 429 -> AI query rate limit exceeded (60 req/min/IP)
# 500 -> Internal server error (never leak raw stack traces)
```

### Validate at Boundaries
Validate strictly at entry points; trust validated models internally:

```python
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api")

@router.get("/tod-score/{station_id}", response_model=TODScoreResponse)
async def get_tod_score(station_id: StationId):
    """Retrieve 5D TOD Score for a specific station node."""
    result = await tod_service.get_score(station_id)
    if not result:
        raise HTTPException(status_code=404, detail={
            "code": "STATION_NOT_FOUND",
            "message": f"Station '{station_id}' not found"
        })
    return result
```

---

## 2. Dual-Output Response Pattern (AI Proxy)

Every spatial AI endpoint returns a structured dual output (machine action + human narrative):

```python
class AIResponse(BaseModel):
    status: str = "success"
    data: dict = Field(default_factory=dict)

class AIData(BaseModel):
    action: str                    # "highlight_and_zoom", "filter_layer", "compare"
    target_layer: str | None       # "h3_tod_score", "h3_njop_premium"
    target_station: str | None
    view_state: dict | None        # {"center": [lon, lat], "zoom": 14.5}
    filter_query: dict | None
    chart_payload: dict | None     # Radar chart data
    text_response: str             # Human narrative
```

---

## 3. Naming Conventions

| Pattern | Convention | TransitERA Example |
|---|---|---|
| REST Endpoints | Plural nouns, no verbs | `GET /api/stations`, `GET /api/tod-scores/{id}` |
| Query Parameters | camelCase | `?sortBy=todScore&minScore=70` |
| Response Fields | snake_case (Python) | `tod_readiness_score`, `station_cluster` |
| Boolean Fields | is/has/can prefix | `is_feeder_connected`, `has_pedestrian_path` |
| Enum Values | snake_case | `"gubeng"`, `"pasar_turi"` |

---

## 4. Prefer Addition Over Modification

Extend schemas without breaking backwards compatibility:

```python
# GOOD: Add optional fields with default values
class TODScoreResponse(BaseModel):
    scenario_delta: float | None = None
    intervention_type: str | None = None
```
