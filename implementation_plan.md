# Transit Routing Engine Visual — TransitERA Commuter Persona

## Latar Belakang & Masalah

Fitur "Koneksi Transit" di panel komuter saat ini bersifat **statis informatif**: menampilkan daftar rute yang lewat di sekitar stasiun, tanpa visualisasi di peta. User terpaksa diarahkan ke Google Maps untuk navigasi nyata — padahal kita sudah punya:
- **16 trayek GeoJSON** dengan geometri LineString riil (Suroboyo Bus R1/R4/R5, Trans Semanggi R2, Feeder WiraWiri FD02–FD12, Bus Tumpuk)
- **Graph koneksi antar stasiun**: tiap rute memiliki `connected_station_ids[]`
- **13 stasiun kereta** yang sudah terhubung ke rute-rute tersebut

Tujuan: Routing engine **berbasis data scraped sendiri**, menggantikan redirect Google Maps.

---

## Arsitektur Solusi

### Komponen Baru yang Dibuat
| File | Peran |
|---|---|
| `src/lib/transit-router.ts` | **Transit Graph Engine** — BFS shortest-path antar stasiun via rute bus/feeder |
| `src/components/map/useTransitRoute.ts` | **Map Hook** — Render geometri rute aktif di peta MapLibre (animasi glow) |
| `src/components/dashboard/TransitRoutePlanner.tsx` | **UI Panel** — Input asal/tujuan + hasil step-by-step routing |

### Komponen yang Dimodifikasi
| File | Perubahan |
|---|---|
| `src/components/map/MapContainer.tsx` | Terima `activeRouteIds` prop untuk highlight rute spesifik di peta |
| `src/components/dashboard/CommuterPanel.tsx` | Embed `TransitRoutePlanner` menggantikan `TravelEstimator`, teruskan `onHighlightRoute` ke map |
| `src/app/map/page.tsx` | Wire `activeRouteIds` state antara CommuterPanel dan MapContainer |
| `src/types/index.ts` | Tambah `TransitRoute`, `RoutePlan`, `RouteStep` types |

---

## Cara Kerja Routing Engine

### 1. Graph Representation (`transit-router.ts`)
```
nodes   = 13 stasiun (gubeng, pasar_turi, wonokromo, waru, ...)
edges   = rute yang menghubungkan 2+ stasiun (sbr1 menghubungkan pasar_turi↔wonokromo↔semut↔waru↔...)
```

Dari data `trayek_surabaya.geojson`, kita bangun adjacency list:
```
gubeng  → tmk2 → [hanya gubeng, tidak ada transfer stasiun via tmk2]
gubeng  → sbr4 → waru, jemursari, kertomenanggal
gubeng  → fd07 → pasar_turi
wonokromo → sbr1 → pasar_turi, semut, waru, margorejo, jemursari, kertomenanggal, kalimas
```

### 2. BFS Multi-Hop Routing
- Input: `from_station_id`, `to_station_id`
- Output: array `RouteStep[]` — urutan (naik rute X, turun di Y, transfer ke rute Z)
- Max transfers: 2 (BFS depth limit)
- Jika `from === to`, tampilkan rute keluar dari stasiun tersebut

### 3. Visualisasi di Peta (`useTransitRoute.ts`)
- Saat hasil routing dihitung, extract `route_id[]` dari steps
- Set `filter` pada layer `transit-routes-line` hanya tampilkan rute-rute tersebut menggunakan `['in', ['get', 'route_id'], ['literal', activeRouteIds]]`
- Animate: `line-width` pulse + `line-opacity` glow
- Rute yang tidak dipilih: redup (`line-opacity: 0.2`)
- Tombol "Reset" untuk kembali ke tampilan semua rute

---

## Desain UI `TransitRoutePlanner`

```
╔══════════════════════════════════╗
║  Routing Engine                  ║
║  [Stasiun Asal   ▾] → [Tujuan ▾]║
║  [Cari Rute]                     ║
╠══════════════════════════════════╣
║  Dari: Gubeng → Tujuan: Benowo   ║
║  3 langkah • 45–55 menit         ║
║  ─────────────────────────────── ║
║  [KRL] Naik di Gubeng             ║
║   ↓ turun di Pasar Turi           ║
║  [SBR5] Naik Suroboyo Bus R5      ║
║   ↓ Tandes → Kandangan → Benowo   ║
║  [  Lihat di Peta  ]              ║
╚══════════════════════════════════╝
```

- Dropdown `from` diisi dengan `activeStation` secara default
- Dropdown `to` menampilkan seluruh 18 simpul transit
- Hasil BFS disajikan sebagai timeline step (mirip Google Maps transit)
- Tombol "Lihat di Peta" → highlight rute-rute yang digunakan di MapLibre
- Saat tidak ada jalur langsung → tampilkan "Rute alternatif via [terminal/simpul terdekat]"

---

## Batasan / Caveats

> [!IMPORTANT]
> Routing ini berfungsi di level **stasiun-ke-stasiun**, bukan door-to-door seperti Google Maps. Ini intentional: TransitERA fokus pada simpul transit (TOD), bukan navigasi pedestrian general. Last-mile walking dari stasiun ke tujuan akhir tetap menjadi domain user.

> [!NOTE]
> Geometri trayek yang divisualisasikan menggunakan **trayek riil hasil scraping** (LineString GeoJSON) — bukan garis lurus A ke B. Ini membuat visualisasinya jauh lebih akurat dan bermakna dibanding mengirim ke Google Maps.

> [!WARNING]  
> Beberapa stasiun (benteng, sidotopo, terminal_joyoboyo, terminal_purabaya) tidak memiliki rute bus yang terhubung di dataset saat ini. Untuk stasiun ini, routing akan menampilkan "Rute feeder belum tersedia — gunakan ojek/angkot ke simpul terdekat."

---

## Proposed Changes

### Core Library

#### [NEW] [`transit-router.ts`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/lib/transit-router.ts)
- `buildTransitGraph(trayek: GeoJSON)` — konstruksi adjacency list
- `findRoute(from: StationId, to: StationId, graph)` — BFS multi-hop
- `estimateTravelTime(steps: RouteStep[])` — estimasi menit per segmen (walk 5 min + bus ~4 mnt/km)

#### [NEW] [`useTransitRoute.ts`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/components/map/useTransitRoute.ts)
- Hook MapLibre GL yang menerima `activeRouteIds: string[]`
- Filter dan highlight rute terpilih, redup sisanya
- Animasi glow pulse pada rute aktif

#### [NEW] [`TransitRoutePlanner.tsx`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/components/dashboard/TransitRoutePlanner.tsx)
- UI input asal/tujuan dengan dropdown 18 simpul
- Invoke `findRoute()` di frontend (no backend needed)
- Render hasil sebagai transit timeline

---

### Modifications

#### [MODIFY] [`types/index.ts`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/types/index.ts)
Tambah:
```ts
export interface RouteStep {
  mode: 'walk' | 'bus' | 'train' | 'feeder';
  route_id?: string;
  route_name?: string;
  line_code?: string;
  line_color?: string;
  from_station: string;
  to_station: string;
  duration_min: number;
  desc: string;
}
export interface RoutePlan {
  from: StationId;
  to: StationId;
  steps: RouteStep[];
  total_min: number;
  route_ids: string[];
  has_transfer: boolean;
}
```

#### [MODIFY] [`MapContainer.tsx`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/components/map/MapContainer.tsx)
- Tambah `activeRouteIds?: string[]` prop
- Pasang `useTransitRoute(map, isMapLoaded, activeRouteIds)`

#### [MODIFY] [`CommuterPanel.tsx`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/components/dashboard/CommuterPanel.tsx)
- Tambah `onHighlightRoute?: (routeIds: string[]) => void` prop
- Replace bagian "Koneksi Transit" dengan `<TransitRoutePlanner>`

#### [MODIFY] [`map/page.tsx`](file:///c:/Users/rayha/OneDrive/Documents/LOMBA/MAPID%20WebGIS%20Competition%202026/webgis-TransitERA-main/webdev/frontend/src/app/map/page.tsx)
- `const [activeRouteIds, setActiveRouteIds] = useState<string[]>([])`
- Wire ke `MapContainer` dan `CommuterPanel`

---

## Verification Plan

### Automated Tests
- `npm test` — vitest suite harus tetap 8/8 pass
- `npm run build` — 0 TypeScript errors

### Manual Verification
1. Switch ke persona **Komuter** → pilih stasiun Gubeng
2. Di TransitRoutePlanner, set tujuan = Benowo → klik "Cari Rute"
3. Verifikasi: timeline muncul (KRL Gubeng → Pasar Turi → SBR5 ke Benowo)
4. Klik "Lihat di Peta" → di peta, trayek sbr1 + sbr5 menyala, sisanya redup
5. Test edge cases: stasiun tanpa rute → pesan fallback yang jelas
6. Test same-station: from = to → tampilkan semua rute keluar dari stasiun tsb
