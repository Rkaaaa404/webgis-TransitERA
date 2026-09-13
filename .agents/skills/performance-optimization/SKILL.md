---
name: performance-optimization
description: "Optimizes TransitERA WebGIS performance. Covers Lighthouse ≥ 85 targets, MapLibre WebGL optimization, H3 layer lazy loading, Core Web Vitals (LCP ≤ 2.5s, FCP < 1.8s, INP ≤ 200ms), PostGIS query optimization, viewport-based data loading, and Redis caching for pre-computed TOD scores."
---

# Performance Optimization (TransitERA)

Panduan optimasi performa untuk **TransitERA WebGIS** — mengadaptasi prinsip dari [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) dengan fokus pada **MapLibre WebGL, H3 rendering, dan PostGIS queries**.

---

## 1. Prinsip Utama

> **Ukur sebelum optimasi.** Pekerjaan performa tanpa pengukuran adalah menebak — dan menebak mengarah pada optimasi prematur yang menambah kompleksitas tanpa meningkatkan hal yang penting. Profile dulu, identifikasi bottleneck aktual, perbaiki, ukur lagi.

---

## 2. Target Performa TransitERA

| Metrik | Target | Sumber |
|--------|--------|--------|
| **Lighthouse Score** | ≥ 85 | PRD Acceptance Criteria |
| **FCP** (First Contentful Paint) | < 1.8s | PRD §8.2 |
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Core Web Vitals |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Core Web Vitals |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Core Web Vitals |
| **AI Response Time** | < 3 detik | PRD §8.2 (Spatial AI Assistant) |
| **API Response Time** | < 500ms | Target internal backend |

---

## 3. Workflow Optimasi

```
1. MEASURE  → Baseline dengan data real
2. IDENTIFY → Temukan bottleneck aktual (bukan asumsi)
3. FIX      → Perbaiki bottleneck spesifik
4. VERIFY   → Ukur lagi; keep atau revert
5. GUARD    → Tambahkan monitoring/test untuk cegah regresi
```

---

## 4. Diagnosis Bottleneck (TransitERA)

```
Apa yang lambat?
├── First page load
│   ├── Bundle besar? → Code splitting, lazy load RadarChart & Scenario
│   ├── TTFB lambat? → Check Vercel edge, MAPID MAPS basemap load time
│   └── Render-blocking? → Defer non-critical CSS/JS
├── Peta H3 lambat ter-render
│   ├── GeoJSON terlalu besar? → Viewport-based loading, simplify geometri
│   ├── Terlalu banyak features? → Cluster di zoom rendah, detail di zoom tinggi
│   └── Animasi jank? → Reduce fill-opacity transitions, batch updates
├── AI response lambat (> 3s)
│   ├── Gemini API latency? → Cache respons populer di Redis
│   ├── PostGIS query lambat? → EXPLAIN ANALYZE, tambah GIST index
│   └── Data payload besar ke Gemini? → Kirim metadata ringkas, bukan raw GeoJSON
└── Dashboard chart lambat
    ├── Re-render berlebihan? → React.memo, useMemo untuk data transforms
    └── Data fetch waterfall? → Prefetch data saat user hover station marker
```

---

## 5. Pola Optimasi Kunci

### Viewport-Based H3 Loading

```typescript
// Hanya load H3 cells yang terlihat di viewport saat ini
map.on('moveend', () => {
  const bounds = map.getBounds();
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ];
  
  // Fetch hanya cells dalam viewport
  fetchH3CellsByBBox(bbox, map.getZoom()).then(geojson => {
    const source = map.getSource('h3-tod-source') as maplibregl.GeoJSONSource;
    source?.setData(geojson);
  });
});
```

### Redis Caching (Pre-Computed Scores)

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)
CACHE_TTL = 3600  # 1 jam

async def get_cached_tod_score(station_id: str):
    cache_key = f"tod_score:{station_id}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Compute dari PostGIS jika cache miss
    result = await compute_tod_score(station_id)
    redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
    return result
```

### Lazy Load Komponen Berat

```typescript
import { lazy, Suspense } from 'react';

const RadarChart5D = lazy(() => import('@/components/dashboard/RadarChart5D'));
const ScenarioSimulator = lazy(() => import('@/components/dashboard/ScenarioSimulator'));

function DashboardPanel({ station }: { station: StationData }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <RadarChart5D stationName={station.name} data={station.radarData} />
      <ScenarioSimulator baselineScore={station.todScore} />
    </Suspense>
  );
}
```

### PostGIS Query Optimization

```sql
-- ❌ Lambat: Full table scan tanpa index
SELECT * FROM h3_tod_analytics
WHERE ST_Intersects(geom, ST_MakeEnvelope(112.70, -7.30, 112.80, -7.25, 4326));

-- ✅ Cepat: Dengan GIST index + ANALYZE
CREATE INDEX IF NOT EXISTS idx_h3_geom ON h3_tod_analytics USING GIST(geom);
ANALYZE h3_tod_analytics;

-- Gunakan && (bounding box operator) untuk pre-filter sebelum ST_Intersects
SELECT * FROM h3_tod_analytics
WHERE geom && ST_MakeEnvelope(112.70, -7.30, 112.80, -7.25, 4326)
  AND ST_Intersects(geom, ST_MakeEnvelope(112.70, -7.30, 112.80, -7.25, 4326));
```

---

## 6. Pengukuran

### Frontend (Lighthouse + Web Vitals)

```bash
# Synthetic: Lighthouse CLI
npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json

# RUM: Web Vitals library
import { onLCP, onINP, onCLS, onFCP } from 'web-vitals';

onLCP(console.log);  // Target ≤ 2.5s
onFCP(console.log);  // Target < 1.8s
onINP(console.log);  // Target ≤ 200ms
onCLS(console.log);  // Target ≤ 0.1
```

### Backend (Response Time)

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Response-Time"] = f"{elapsed_ms:.1f}ms"
    return response
```

---

## 7. Vercel React & Next.js 16 Web Vitals Playbook

Terapkan aturan kunci dari Vercel Engineering untuk menjamin Core Web Vitals:
1. **Eliminasi Network Waterfalls (Kritis)**:
   - Mulai promise sedini mungkin dan gunakan `Promise.all()` untuk request independen (misal: memuat layer stasiun dan layer polygon kecamatan).
2. **Optimasi Bundle Size**:
   - Impor langsung modul spesifik, hindari import melalui barrel files raksasa.
   - Pindahkan komponen berat (MapLibre, Radar Chart, Simulator) ke `next/dynamic`.
3. **Mencegah Re-render Berlebih**:
   - Turunkan nilai boolean/primitif saat render, hindari sinkronisasi state via `useEffect` yang memicu re-render ganda.
   - Gunakan `useDeferredValue` untuk input pencarian stasiun/POI agar frame rate peta WebGL tidak terdegradasi.
4. **Lifecycle & Memory WebGL**:
   - Cegah memory leak WebGL: saat layer dimatikan, bersihkan sumber GeoJSON (`map.removeSource()`, `map.removeLayer()`).
   - Batasi jumlah hexagon H3 yang dirender dalam satu viewport menggunakan bounding box filtering.
