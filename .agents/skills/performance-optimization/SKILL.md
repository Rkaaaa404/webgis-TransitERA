---
name: performance-optimization
description: "Optimizes TransitERA WebGIS performance. Covers Lighthouse ≥ 85 targets, MapLibre WebGL optimization, H3 layer lazy loading, Core Web Vitals (LCP ≤ 2.5s, FCP < 1.8s, INP ≤ 200ms), PostGIS query optimization, viewport-based data loading, and Redis caching for pre-computed TOD scores."
---

# Performance Optimization (TransitERA)

Performance engineering standards for **TransitERA WebGIS**, focusing on **MapLibre WebGL rendering, Uber H3 indexing, and PostGIS spatial queries**.

---

## 1. Core Principles

> **Measure before optimizing.** Optimization without profiling is guesswork, which leads to premature complexity. Measure baseline metrics with production data, isolate the true bottleneck, fix it, and verify improvement.

---

## 2. TransitERA Performance Targets

| Metric | Target | Source / Requirement |
|---|---|---|
| **Lighthouse Performance** | $\ge 85$ | PRD Acceptance Criteria |
| **FCP (First Contentful Paint)** | $< 1.8\text{s}$ | PRD §8.2 |
| **LCP (Largest Contentful Paint)** | $\le 2.5\text{s}$ | Core Web Vitals |
| **INP (Interaction to Next Paint)** | $\le 200\text{ms}$ | Core Web Vitals |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | Core Web Vitals |
| **Spatial AI Response Latency** | $< 3.0\text{s}$ | PRD §8.2 |
| **FastAPI Backend Latency** | $< 500\text{ms}$ | Internal SLA |

---

## 3. Bottleneck Triage

```
Where is the latency occurring?
├── First Page Load (LCP / FCP)
│   ├── Large JS bundle? -> Split chunks, lazy load MapLibre & Recharts via next/dynamic
│   ├── Slow TTFB? -> Inspect edge caching, MAPID style CDN latency
│   └── Render-blocking assets? -> Defer non-critical CSS/fonts
├── H3 Choropleth Rendering Latency
│   ├── Massive GeoJSON payload? -> Viewport-based bounding box filtering
│   ├── Too many polygons? -> Render centroids at low zoom, full hexagons at zoom >= 13
│   └── WebGL frame drops? -> Throttle paint property updates; reuse vector sources
├── Spatial AI Query Latency (> 3s)
│   ├── Gemini API roundtrip? -> Cache frequent queries and responses
│   ├── Slow PostGIS lookup? -> Run EXPLAIN ANALYZE; verify GIST index
│   └── Overly large context payload? -> Send compact tabular summaries, not raw GeoJSON
└── Dashboard UI Jank
    ├── Excess React re-renders? -> Memoize radar chart data transforms (useMemo)
    └── Request waterfalls? -> Parallelize API calls using Promise.all()
```

---

## 4. Key Optimization Patterns

### Viewport-Based H3 Data Loading
```typescript
map.on('moveend', () => {
  const bounds = map.getBounds();
  const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
  
  fetchH3CellsByBBox(bbox, map.getZoom()).then(geojson => {
    const source = map.getSource('h3-tod-source') as maplibregl.GeoJSONSource;
    source?.setData(geojson);
  });
});
```

### Dynamic Code Splitting for Heavy Modules
```typescript
import dynamic from 'next/dynamic';

const DynamicRadarChart5D = dynamic(() => import('@/components/dashboard/RadarChart5D'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-slate-900/50 rounded-xl" />
});
```

### PostGIS Spatial Index Optimization
```sql
-- Fast bounding box pre-filter using && operator with GIST index
CREATE INDEX IF NOT EXISTS idx_h3_geom ON h3_tod_analytics USING GIST(geom);
ANALYZE h3_tod_analytics;

SELECT * FROM h3_tod_analytics
WHERE geom && ST_MakeEnvelope(112.70, -7.30, 112.80, -7.25, 4326)
  AND ST_Intersects(geom, ST_MakeEnvelope(112.70, -7.30, 112.80, -7.25, 4326));
```

---

## 5. Vercel React & Next.js 16 Web Vitals Playbook

1. **Eliminate Network Waterfalls**: Parallelize independent fetches with `Promise.all()`.
2. **Bundle Trimming**: Avoid giant barrel files; import directly from specific subpaths.
3. **Prevent Re-render Cascades**: Derive state during render instead of triggering second-pass renders via `useEffect`. Use `useDeferredValue` for fast map search typing.
4. **WebGL Memory Guard**: Clean up MapLibre instances, sources, and event listeners on component unmount to prevent WebGL context exhaustion.
