---
name: debugging-and-error-recovery
description: "Systematic root-cause debugging for TransitERA WebGIS. Covers structured triage for MapLibre WebGL errors, Gemini API Function Calling failures, PostGIS spatial query issues, H3 rendering glitches, and the Stop-the-Line rule for error recovery."
---

# Debugging and Error Recovery (TransitERA)

Systematic root-cause debugging protocols for **TransitERA WebGIS**, covering **MapLibre GL JS + FastAPI + Google Gemini API + PostGIS**.

---

## 1. The Stop-the-Line Rule

When unexpected errors or broken states occur:

```
1. STOP adding features or expanding scope
2. PRESERVE evidence (console logs, stack traces, reproduction inputs)
3. LOCALIZE using the architectural triage checklist
4. FIX root cause at the source
5. GUARD with automated regression tests
6. RESUME development only when tests pass
```

**Never push past a broken test or failing build.** Latent bugs compound exponentially.

---

## 2. TransitERA Architectural Triage Checklist

```
Which layer exhibits the failure?
├── MapLibre GL JS / Frontend
│   ├── Browser Console errors? -> Inspect DevTools WebGL warnings
│   ├── Blank/black map? -> Check MAPID API key, fallback style URL, CORS headers
│   ├── H3 cells invisible? -> Inspect GeoJSON feature collections and fill paint opacity
│   └── Frame drops? -> Check WebGL context count, unmount lingering map instances
├── FastAPI / Backend
│   ├── 500 Server Error? -> Inspect server tracebacks and unhandled exceptions
│   ├── 422 Validation Error? -> Compare Pydantic schema constraints vs request payload
│   └── Request Timeout? -> Check PostGIS query execution plan (EXPLAIN ANALYZE)
├── Google Gemini API
│   ├── Function Call not triggered? -> Verify tool schema definitions and few-shot examples
│   ├── Out-of-bounds coordinates? -> Ensure Surabaya bounding box guardrail activates
│   ├── 429 Rate Limited? -> Implement exponential backoff and cached responses
│   └── Malformed response? -> Enforce structured response schema (response_mime_type="application/json")
├── PostGIS / Database
│   ├── Slow spatial joins? -> Verify GIST spatial index on geometry column
│   ├── H3 cell mismatch? -> Check resolution consistency (res 8 vs res 9)
│   └── Empty query results? -> Verify coordinate order (Longitude, Latitude)
└── Test Infrastructure
    └── Is the test asserting valid business invariants? (Eliminate false negatives)
```

---

## 3. Fix the Root Cause, Not the Symptom

```
Symptom: "Map renders H3 hexagons over open water in the Madura Strait"

Symptom Patch (BAD):
  -> Filter out water coordinates on the client frontend before rendering.

Root Cause Fix (GOOD):
  -> Fix the PostGIS spatial intersection query to clip against the official
     administrative land polygon before generating H3 hexagonal indexes.
```

---

## 4. Specific Failure Patterns & Solutions

### Gemini API Function Calling Drift
- **Symptom**: Model hallucinates parameters or fails to invoke dispatch functions.
- **Fix**: Use strict Pydantic schemas with descriptions and add targeted few-shot interaction pairs to the proxy system prompt.

### MapLibre WebGL Context Loss
- **Symptom**: Map canvas blanks out after the browser tab is kept in the background.
- **Fix**: Register a listener on `webglcontextlost`, call `preventDefault()`, and trigger a clean re-initialization.

### PostGIS Spatial Join Timeout
- **Symptom**: Sequential scans on large station/polygon datasets cause HTTP 504.
- **Fix**: Ensure GIST spatial indexing and optimize with the bounding box `&&` operator:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_h3_geom ON h3_tod_analytics USING GIST(geom);
  ANALYZE h3_tod_analytics;
  ```

---

## 5. Git Bisection for Regression Bugs
```bash
git bisect start
git bisect bad                    # Current broken commit
git bisect good <known-good-sha> # Last known stable commit
git bisect run pytest -k "test_spatial_regression"
```
