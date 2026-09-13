---
name: planning-and-task-breakdown
description: "Breaks TransitERA WebGIS work into ordered, verifiable tasks aligned with the 5.5-week M1-M8 sprint timeline. Covers dependency graph mapping, vertical slicing, acceptance criteria, and checkpoint-based verification."
---

# Planning and Task Breakdown (TransitERA)

Work decomposition guidelines for **TransitERA WebGIS**, structured for vertical slicing and the **5.5-week (M1–M8) sprint cycle**.

---

## 1. Planning Principles

### Enter Plan Mode First
Before writing code, operate in read-only analysis mode:
- Read specifications, PRDs, and relevant codebase modules.
- Identify existing conventions and reuse opportunities.
- Map component dependencies and interface boundaries.
- Explicitly surface risks and unknowns.

**DO NOT write production code during planning.** Output a plan artifact, not an implementation.

---

## 2. TransitERA Dependency Hierarchy

```
PostgreSQL / PostGIS Schema
    │
    ├── Spatial Data Pipeline (ETL: GEO MAPID → PostGIS)
    │       │
    │       ├── Uber H3 Grid Indexing (h3-py)
    │       │       │
    │       │       ├── AHP 5D TOD Scoring
    │       │       │       │
    │       │       │       └── SDM Spatial Regression
    │       │       │
    │       │       └── Typology Classification (PCA + Random Forest)
    │       │
    │       └── Survey Synchronization
    │
    ├── FastAPI Backend
    │       │
    │       ├── REST API Endpoints (/tod-score, /njop-premium)
    │       │       │
    │       │       └── Next.js 16 API Client
    │       │               │
    │       │               └── WebGIS Presentation (MapLibre, Radar Charts)
    │       │
    │       └── Gemini Spatial AI Proxy (/ai/query)
    │               │
    │               └── Spatial AI Assistant Panel
    │
    └── MAPID MAPS Basemaps -> MapLibre GL JS Instance
```

---

## 3. Vertical Slicing (Not Horizontal Layers)

- **POOR (Horizontal Layer Slicing)**:
  - Task 1: Create all DB tables
  - Task 2: Build all API routes
  - Task 3: Build all UI components
  - Task 4: Attempt end-to-end connection (High risk, late failure)

- **GOOD (Vertical Feature Slicing)**:
  - Task 1: Basemap & Stasiun Marker (DB -> API -> MapLibre render)
  - Task 2: H3 TOD Choropleth (H3 grid -> AHP score -> API -> MapLibre layer)
  - Task 3: 5D Radar Scorecard (Station data -> API -> Recharts radar view)
  - Task 4: Spatial AI Dispatcher (Query -> Gemini proxy -> Dual output render)
  - Task 5: Scenario Simulator (What-if model -> API -> Slider delta view)

---

## 4. Task Specification Format

```markdown
## Task [N]: [Concise Title]

**Description**: What this task achieves in one paragraph.

**Acceptance Criteria**:
- [ ] [Concrete, testable invariant]
- [ ] [Concrete, testable invariant]

**Verification**:
- [ ] Tests pass: `pytest -k "test_feature"` / `npm run build`
- [ ] Manual verification: [Clear step-by-step check]

**Dependencies**: [Prerequisite Task IDs or "None"]
**Estimated Scope**: [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

---

## 5. Risk-First Sequencing
Sequence tasks so that:
1. Prerequisite dependencies are satisfied bottom-up.
2. High-uncertainty external dependencies (MAPID API, Gemini API, PostGIS spatial queries) fail fast early.
3. Every task leaves the codebase in a clean, working, testable state.
