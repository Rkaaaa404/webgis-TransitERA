---
name: test-driven-development
description: "Drives development with tests for TransitERA WebGIS. Covers the RED-GREEN-REFACTOR cycle, PyTest for FastAPI backend (spatial queries, AHP validation CR ≤ 0.10), Vitest for Next.js frontend components, Gemini AI response validation (≥ 90% curated prompt success), and the Prove-It bug fix pattern."
---

# Test-Driven Development (TransitERA)

Test-Driven Development (TDD) workflow for **TransitERA WebGIS**, using **PyTest (FastAPI backend)** and **Vitest (Next.js frontend)**.

---

## 1. The TDD Cycle

```
     RED                GREEN              REFACTOR
  Write a test    Write minimal code    Clean up the
  that fails  ──→  to make it pass  ──→  implementation  ──→  (repeat)
       │                  │                    │
       ▼                  ▼                    ▼
    Test FAILS        Test PASSES         Tests still PASS
```

### Tooling Execution
- **Backend (Python)**: `pytest` or focused with `pytest -k "test_name"`
- **Frontend (TypeScript)**: `npx vitest run` or focused with `npx vitest run --grep "test name"`

---

## 2. Domain Test Examples (PyTest)

### AHP Consistency Ratio Validation ($CR \le 0.10$)
```python
import numpy as np
from app.spatial.ahp import calculate_ahp_weights

def test_ahp_consistency_ratio_within_threshold():
    """Consistency Ratio must be <= 0.10 for valid 5D TOD weighting."""
    pairwise_matrix = np.array([
        [1,   3,   5,   7,   9],
        [1/3, 1,   3,   5,   7],
        [1/5, 1/3, 1,   3,   5],
        [1/7, 1/5, 1/3, 1,   3],
        [1/9, 1/7, 1/5, 1/3, 1],
    ])
    
    weights, cr = calculate_ahp_weights(pairwise_matrix)
    assert cr <= 0.10, f"CR = {cr:.4f} exceeds 0.10 threshold"
    assert len(weights) == 5
    assert abs(sum(weights) - 1.0) < 1e-6
```

### TOD Score API Endpoint Contract
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_get_tod_score_valid_station():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/tod-score/gubeng")
    
    assert response.status_code == 200
    data = response.json()
    assert "tod_readiness_score" in data
    assert 0 <= data["tod_readiness_score"] <= 100
```

---

## 3. The Prove-It Bug Fix Pattern

When a bug is reported:
1. **Write a failing test** that isolates and reproduces the reported defect.
2. **Confirm test FAILS** (proving the bug exists).
3. **Implement the minimal surgical fix**.
4. **Confirm test PASSES** (proving the fix works).
5. **Run the full test suite** to ensure zero regressions.
