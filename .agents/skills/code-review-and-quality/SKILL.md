---
name: code-review-and-quality
description: "Multi-axis code review for TransitERA WebGIS. Covers five-axis review (correctness, readability, architecture, security, performance), TypeScript strict mode, Python type hints, change sizing, structural remedies, and quality gates before merge."
---

# Code Review and Quality (TransitERA)

Multi-dimensional code review standards for **TransitERA WebGIS**, covering **TypeScript (Next.js 16)** and **Python (FastAPI)**.

---

## 1. Approval Standards

> **Approve changes that measurably improve overall code health**, even if imperfect. The goal is continuous improvement, not perfection. Do not block PRs simply because you would have formatted or implemented it slightly differently.

---

## 2. Five-Axis Review

Evaluate all changes across 5 dimensions:

### Axis 1: Correctness
- Conforms to task requirements and specifications.
- Handles edge cases (null, empty arrays, boundary coordinates).
- Handles error paths gracefully (not just happy paths).
- All tests pass and assert real domain invariants.
- **TransitERA Specifics:**
  - Coordinates validated against Surabaya bounding box (`[112.55, -7.38]` to `[112.85, -7.18]`).
  - AHP Consistency Ratio $CR \le 0.10$.
  - Consistent Uber H3 resolutions (8 for macro analysis, 9 for walkability buffers).

### Axis 2: Readability & Simplicity
- Descriptive, intention-revealing names (no ambiguous `temp`, `data`, `res`).
- Straightforward control flow; avoid deeply nested conditionals.
- **YAGNI & Conciseness**: If 100 lines can solve it cleanly, reject a 500-line over-abstraction.
- **TransitERA Specifics:**
  - Strict **Anti-Emoji Rule**: Zero raw Unicode emojis in user interfaces. Wajib use `lucide-react`.
  - Pydantic models document request/response contracts explicitly.

### Axis 3: Architecture
- Preserves clean module boundaries.
- Separates data fetching from presentation components.
- Heavy spatial computations reside in backend / PostGIS, not client thread.
- AI orchestration resides in backend proxy, not exposed frontend callers.

### Axis 4: Security
- Validates input at system boundaries.
- Zero secrets, tokens, or plaintext passwords in code, logs, or git commits.
- All SQL queries parameterized (SQLAlchemy / GeoAlchemy2).
- Passes `python scripts/scan_secrets.py` with 0 findings.

### Axis 5: Performance
- No N+1 database queries.
- No unbounded client fetching.
- Heavy components (MapLibre, Radar Charts, Simulators) dynamically imported with `ssr: false`.
- Network waterfalls eliminated using `Promise.all()`.

---

## 3. Change Sizing & Scope
- **~100 lines changed**: Optimal. Single review pass.
- **~300 lines changed**: Acceptable for a cohesive logical change.
- **>1000 lines changed**: Too large. Must be split.
- **Separate Refactoring from Features**: Do not combine large refactors with new feature logic in the same commit.

---

## 4. Type Safety Standards

### TypeScript (Frontend)
```typescript
// GOOD: Strict interface
interface StationTODData {
  stationId: string;
  stationName: string;
  todReadinessScore: number;
  dimensions: {
    density: number;
    diversity: number;
    design: number;
    destinationAccessibility: number;
    distanceToTransit: number;
  };
  typology: 'commercial_transit_hub' | 'mixed_use_residential' | 'low_accessibility_feeder';
}

// BAD: Any type
const data: any = await fetchData();
```

### Python (Backend)
```python
# GOOD: Pydantic v2 type hints
from pydantic import BaseModel, Field

class TODScore(BaseModel):
    station_id: str
    tod_readiness_score: float = Field(..., ge=0, le=100)
    density: float
    diversity: float
    design: float
    destination_accessibility: float
    distance_to_transit: float
```

---

## 5. Karpathy Surgical Review Checklist
Before concluding review:
1. **Surgical Verification**: Does every changed line trace directly to the requested task?
2. **Cleanup Check**: Were orphaned imports, variables, or helpers cleanly removed?
3. **No Unrelated Touches**: Did the author refrain from refactoring working adjacent code?
4. **Automated Gates**: Did `npm run build` and `pytest` pass with 0 errors?
