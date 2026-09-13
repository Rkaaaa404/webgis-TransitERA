---
name: frontend-ui-engineering
description: "Production-quality frontend UI engineering for TransitERA WebGIS. Covers React 19 / Next.js App Router component architecture, MapLibre GL JS interactive map patterns, H3 choropleth rendering, Recharts radar charts, Tailwind CSS, responsive mobile bottom sheets, accessibility, and Lighthouse ≥ 85 performance targets."
---

# Frontend UI Engineering (TransitERA)

Panduan membangun antarmuka pengguna berkualitas produksi untuk **TransitERA WebGIS** — mengintegrasikan best practices dari [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) dengan pola komponen spesifik TransitERA.

---

## 1. Arsitektur Komponen

### Struktur File Proyek

```
src/
├── app/
│   ├── layout.tsx              # Root layout + Fonts + Theme Provider
│   ├── page.tsx                # Main WebGIS Single-Page App (Split View)
│   ├── metodologi/page.tsx     # Dokumentasi Metodologi & Sumber Data
│   └── survey/page.tsx         # Dokumentasi & Galeri Survei Lapangan
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx    # MapLibre instance & viewport controller
│   │   ├── H3ChoroplethLayer.tsx # Layer H3 TOD Score & %ΔNJOP
│   │   ├── StationMarkers.tsx  # Titik simpul stasiun SRRL & halte feeder
│   │   ├── SurveyPointsLayer.tsx # Titik survei Activity & Mission
│   │   └── LayerControl.tsx    # Toggle layer & legend warna
│   ├── dashboard/
│   │   ├── Scorecard5D.tsx     # Scorecard numerik per dimensi TOD
│   │   ├── RadarChart5D.tsx    # Recharts Radar Chart perbandingan stasiun
│   │   └── ScenarioSimulator.tsx # What-if simulator slider intervensi
│   ├── ai/
│   │   ├── AIChatPanel.tsx     # Chat bubble & streaming response UI
│   │   └── CuratedPromptChips.tsx # Tombol quick prompt terkurasi
│   └── ui/
│       ├── MobileBottomSheet.tsx # Draggable drawer untuk tampilan mobile
│       └── HeaderNav.tsx       # Logo, station dropdown, & theme toggle
```

### Pola Komponen

**Utamakan komposisi di atas konfigurasi:**

```tsx
// ✅ Baik: Composable
<Card>
  <CardHeader>
    <CardTitle>Analisis 5D TOD</CardTitle>
  </CardHeader>
  <CardBody>
    <RadarChart5D data={stationData} />
  </CardBody>
</Card>

// ❌ Hindari: Over-configured
<Card
  title="Analisis 5D TOD"
  headerVariant="large"
  content={<RadarChart5D data={stationData} />}
/>
```

**Pisahkan data fetching dari presentasi:**

```tsx
// Container: handles data
export function StationDashboardContainer({ stationId }: { stationId: string }) {
  const { data, isLoading, error } = useStationTODScore(stationId);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message="Gagal memuat data TOD" retry={refetch} />;
  if (!data) return <EmptyState message="Belum ada data untuk stasiun ini" />;

  return <StationDashboard data={data} />;
}

// Presentation: handles rendering
export function StationDashboard({ data }: { data: StationTODData }) {
  return (
    <div className="space-y-4">
      <Scorecard5D scores={data.scores} />
      <RadarChart5D stationName={data.name} data={data.radarData} />
    </div>
  );
}
```

**Komponen fokus pada satu tugas:**

```tsx
export function StationMarker({ station, onClick }: StationMarkerProps) {
  return (
    <Marker longitude={station.lon} latitude={station.lat}>
      <button
        onClick={() => onClick(station.id)}
        className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg"
        aria-label={`Stasiun ${station.name}`}
      />
    </Marker>
  );
}
```

---

## 2. State Management

Pilih pendekatan paling sederhana yang bekerja:

```
Local state (useState)           → UI state per komponen (panel terbuka/tertutup)
Lifted state                     → Shared antara 2-3 komponen sibling
Context                          → Theme, active station, locale (read-heavy, write-rare)
URL state (searchParams)         → Filter layer, zoom level, selected station (shareable)
Server state (React Query, SWR)  → Data TOD Score, survey data, Gemini responses
Global store (Zustand)           → Kompleks: multi-layer visibility, scenario state
```

**Hindari prop drilling lebih dari 3 level.** Jika passing props melalui komponen yang tidak menggunakannya, gunakan context atau restrukturisasi component tree.

---

## 3. Rendering H3 Choropleth di MapLibre GL JS

Menerapkan gradasi warna dinamis (*Color Ramps*) berbasis nilai `tod_readiness_score` (0–100):

```typescript
export function addH3ChoroplethLayer(map: maplibregl.Map, geojsonData: any) {
  // Tambah source data H3
  map.addSource('h3-tod-source', {
    type: 'geojson',
    data: geojsonData
  });

  // Layer Fill Poligon H3
  map.addLayer({
    id: 'h3-tod-fill',
    type: 'fill',
    source: 'h3-tod-source',
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'tod_readiness_score'],
        0, '#ef4444',    // Rendah (Merah)
        50, '#f59e0b',   // Sedang (Kuning/Oranye)
        75, '#10b981',   // Baik (Hijau Muda)
        100, '#047857'   // Sangat Baik (Hijau Tua)
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.85,
        0.60
      ]
    }
  });

  // Layer Garis Batas H3
  map.addLayer({
    id: 'h3-tod-border',
    type: 'line',
    source: 'h3-tod-source',
    paint: {
      'line-color': '#ffffff',
      'line-width': 0.8,
      'line-opacity': 0.7
    }
  });
}
```

---

## 4. Komponen Radar Chart 5D TOD (Recharts)

Visualisasi komparasi 5 dimensi TOD (Density, Diversity, Design, Destination, Distance) per simpul transit:

```tsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Radar5DProps {
  stationName: string;
  data: {
    dimension: string;
    score: number;
    benchmark: number;
  }[];
}

export const RadarChart5D: React.FC<Radar5DProps> = ({ stationName, data }) => {
  return (
    <div className="w-full h-64 bg-slate-900/50 backdrop-blur-md rounded-xl p-3 border border-slate-800">
      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        Analisis 5D TOD — {stationName}
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar name={stationName} dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
          <Radar name="Rata-rata Koridor" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## 5. Mobile Bottom Sheet Pattern

Memastikan navigasi tetap intuitif pada layar *smartphone*:

* Peta mengambil 100% viewport layar.
* Kontrol filter, radar chart, dan Spatial AI Chat disematkan dalam *draggable bottom drawer* (bisa ditarik ke 3 *snap points*: 15% minimized peek, 50% half view, 90% full expand).
* Floating Action Button (FAB) untuk membuka AI Chat Assistant secara instan.

---

## 6. Hindari Estetika "AI-Generated"

| Pola AI Default | Mengapa Bermasalah | Kualitas Produksi |
|---|---|---|
| Purple/indigo di mana-mana | Semua app terlihat sama | Gunakan palet warna TransitERA yang sudah ditetapkan |
| Gradien berlebihan | Menambah noise visual | Gradien halus sesuai design system |
| Rounded-2xl di semua elemen | Mengabaikan hierarki visual | Border-radius konsisten dari design system |
| Padding oversized di mana-mana | Menghancurkan hierarki visual | Skala spacing konsisten |
| Copy Lorem ipsum | Menyembunyikan masalah layout | Konten realistis (nama stasiun, skor TOD) |

---

## 7. Standar Performa Frontend (Lighthouse ≥ 85)

1. **Lazy Loading Layers**: Data titik survei masif dimuat secara bertahap saat zoom level ≥ 12.
2. **WebGL Cleanup**: Bersihkan instance MapLibre dan WebGL context saat unmount komponen:
   ```typescript
   useEffect(() => {
     return () => {
       mapInstance?.remove();
     };
   }, [mapInstance]);
   ```
3. **Responsive Image Optimization**: Gunakan `next/image` dengan format WebP untuk dokumentasi foto survei.
4. **Code Splitting**: Lazy load komponen berat (RadarChart, ScenarioSimulator) menggunakan `React.lazy()` + `Suspense`.
5. **Core Web Vitals Targets**:
   - **LCP** ≤ 2.5s
   - **FCP** < 1.8s (sesuai PRD)
   - **INP** ≤ 200ms
   - **CLS** ≤ 0.1

---

## 8. Standar Ikonografi & Komponen UI (Anti-Emoji Rule)

> [!IMPORTANT]
> **DILARANG MENGGUNAKAN EMOJI MENTAH DI UI PRODUKSI**
> Jangan menggunakan karakter emoji Unicode (seperti 🚏, 🌊, 🚄, ✨, 👁️, 📈, 🚀, 💡, 🏷️, dll.) pada teks antarmuka, label tombol, kartu dashboard, badge, popup peta, atau modal dialog.

### Mengapa Dilarang?
1. **Inkonsistensi Render Lintas Platform**: Emoji dirender sangat berbeda di Windows, macOS, iOS, Android, dan Linux. Perbedaan ukuran font dan geometri emoji dapat merusak *vertical alignment* dan hierarki visual.
2. **Kesan Tidak Profesional**: Penggunaan emoji mentah yang marak memberi kesan *toy project* atau purwarupa terburu-buru, bukan produk enterprise WebGIS yang siap dipertandingkan.
3. **Aksesibilitas (a11y) Buruk**: Pembaca layar (*screen reader*) membacakan label emoji secara harfiah sehingga mengaburkan konteks navigasi bagi penyandang disabilitas.

### Alternatif Komponen yang Wajib Digunakan:
1. **Lucide Icons (`lucide-react`)**:
   - Default utama untuk ikon antarmuka TransitERA. Scalable, konsisten, ukuran terkontrol via class Tailwind (`w-4 h-4`, `w-3.5 h-3.5`).
   - Panduan mapping:
     - Feeder / Halte Bus: `<Bus className="w-4 h-4 text-emerald-400" />`
     - Risiko Bahaya Banjir: `<CloudRain className="w-4 h-4 text-blue-400" />`
     - Simpul Stasiun Transit: `<TrainFront className="w-4 h-4 text-sky-400" />` atau `<Navigation className="w-4 h-4" />`
     - Radiansi Cahaya Malam (NTL) / AI: `<Sparkles className="w-4 h-4 text-amber-400" />`
     - Titik Survei Lapangan: `<Eye className="w-4 h-4 text-cyan-400" />`
     - Lokasi / Geometri: `<MapPin className="w-4 h-4 text-brand-lime" />`
     - Metrik / Grafik: `<BarChart3 className="w-4 h-4" />` atau `<TrendingUp className="w-4 h-4" />`
2. **shadcn/ui & Radix UI Primitives**:
   - Gunakan komponen primitif accessible untuk interaksi kompleks:
     - Status & Tag: Gunakan `<Badge variant="...">` daripada teks ber-emoji.
     - Penjelasan fitur: Gunakan `<Tooltip>` dengan teks ringkas.
     - Kontrol & Pilihan: Gunakan `<DropdownMenu>`, `<Tabs>`, `<Slider>`, `<Popover>`.
3. **Mantine UI**:
   - Gunakan komponen Mantine jika membutuhkan:
     - Segmented Controls (`@mantine/core`) untuk selektor mode visualisasi.
     - Data Tables / Advanced Grids untuk rekapitulasi data survei 360 titik.
     - Notification Toasts yang bersih dan animasi halus.
4. **SVG Vektor / Kartografi Khusus**:
   - Untuk indikator popup MapLibre, buat elemen HTML dengan icon SVG inline atau styling badge CSS yang konsisten dengan tema Dark Mode TransitERA.

---

## 9. Evil Martians Tailwind CSS Best Practices

Untuk menjaga keterbacaan dan pemeliharaan codebase styling:
1. **Pangkas Utility Classes Redundan**:
   - `pt-4 pb-4` → `py-4`
   - `flex flex-row justify-between` → `flex justify-between` (`flex-row` adalah default)
   - `border border-dotted border-2 border-black border-opacity-50` → `border-dotted border-2 border-black/50`
2. **Kelompokkan Token Semantik & Hindari Magic Values**:
   - Jangan gunakan magic values liar (`p-[13px]`, `text-[#aabbcc]`). Gunakan token tema (`p-3`, `text-slate-400`, `bg-brand-indigo`).
   - Berikan nama semantik: `primary`, `accent`, `destructive`, bukan nama literal hex.
3. **Hindari `@apply` Berlebihan**:
   - Ekstrak styling berulang ke dalam komponen React kecil dan reusable, bukan membuat class CSS buatan dengan `@apply`.
4. **Gunakan Fixed Variant Maps untuk Komponen Shared**:
   ```tsx
   const BADGE_VARIANTS = {
     todHigh: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
     todMedium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
     todLow: "bg-rose-500/20 text-rose-400 border-rose-500/30",
   };
   ```

---

## 10. Next.js 16 & React 19 App Router Standards

1. **Async Request APIs**:
   - Pada Next.js 16, `params`, `searchParams`, `cookies()`, dan `headers()` bersifat asynchronous. Selalu gunakan `await params`.
2. **Server Components by Default**:
   - Komponen halaman, metadata, dan layout berjalan sebagai Server Components.
   - Tandai `"use client"` secara eksplisit hanya pada leaf components yang membutuhkan state, event listener, browser API, atau MapLibre/Recharts.
3. **Dynamic Import untuk Library Client Berat**:
   - Selalu load komponen MapLibre dan visualisasi data menggunakan `next/dynamic` dengan `ssr: false`:
   ```tsx
   const DynamicMapContainer = dynamic(() => import('@/components/map/MapContainer'), {
     ssr: false,
     loading: () => <MapSkeleton />,
   });
   ```
4. **Eliminasi Waterfall Request**:
   - Gunakan `Promise.all()` saat memuat beberapa data spasial atau endpoint backend secara paralel.

