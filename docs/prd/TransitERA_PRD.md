# TransitERA — Master Product Requirement Document (PRD)
**WebGIS Decision Support System for TOD Readiness & Land Value Assessment in Surabaya**
*MAPID WebGIS Competition 2026: Maps That Think! — Mass Transportation Edition*

---

## 1. Ringkasan Eksekutif & Core Value Engine

**TransitERA** adalah platform WebGIS interaktif berbasis *Spatial Intelligence & Decision Support System* untuk mengevaluasi kesiapan kawasan *Transit-Oriented Development* (TOD) dan mengestimasi keterkaitannya dengan nilai lahan (%ΔNJOP) di Kota Surabaya, dengan fokus koridor *Surabaya Regional Railway Line* (SRRL) serta pengumpan WiraWiri Suroboyo dan Suroboyo Bus.

```
                  ┌───────────────────────────────────────────────┐
                  │          CORE DECISION ENGINE TransitERA      │
                  │   H3 5D TOD Readiness + Land Value (SDM) + AI  │
                  └───────────────────────┬───────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│   GOVERNMENT / PLANNER    │ │    BUSINESS / INVESTOR    │ │     COMMUTER / UMKM       │
│ • H3 5D Scorecard & Radar │ │ • Spatial Durbin %ΔNJOP   │ │ • Proksi Daya Beli Transaksi│
│ • Simulasi Feeder What-If │ │ • Profil Pasar & ZNT      │ │ • Spatial AI Assistant Chat │
│ • Rekomendasi Intervensi  │ │ • Filter Komersial        │ │ • Rekomendasi Lokasi Usaha  │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

### Problem & Solution Matrix
- **Problem 1 (Fragmentasi Data Spasial):** Data kepadatan, nilai tanah (ZNT), risiko banjir, dan fasilitas pedestrian terisolasi antarinstansi.
  - *Solusi:* Agregasi seragam ke **Uber H3 Hexagonal Grid (Resolusi 8–9)** dan skoring **AHP 5D TOD (0–100)**.
- **Problem 2 (Ketiadaan Data Dampak Nilai Lahan):** Sulit memprediksi dampak transit terhadap apresiasi properti.
  - *Solusi:* Ekonometrika spasial **Spatial Durbin Model (SDM)** untuk mengukur direct & spillover effect (%ΔNJOP).
- **Problem 3 (Tenant Mismatch UMKM):** Pelaku usaha memilih lokasi tanpa data daya beli dan keramaian riil.
  - *Solusi:* Profil kesesuaian lokasi berbasis transaksi riil (**Struk Go & Menu Go**) + **Spatial AI Assistant** (Google Gemini).

---

## 2. Tiga Peran Pengguna & Kebutuhan Fungsional

### 2.1 Role 1: Urban Planner / Government (Dishub Surabaya)
- **Fokus:** Penentuan prioritas alokasi anggaran infrastruktur pejalan kaki dan perancangan rute feeder.
- **Fitur Kunci:**
  1. H3 Choropleth TOD Readiness Score (0–100) per sel grid.
  2. 5D Radar Chart (Density, Diversity, Design, Destination Accessibility, Distance to Transit).
  3. Simulasi Skenario Intervensi (*What-If* penambahan rute/halte feeder).
  4. Indikator Dimensi Terlemah otomatis untuk rekomendasi kebijakan.
- **User Story:** *"Sebagai Perencana Kota, saya ingin melihat skor TOD dan dimensi terlemah di setiap stasiun agar anggaran trotoar tepat sasaran."*

### 2.2 Role 2: Property & Site Analyst / Investor
- **Fokus:** Evaluasi potensi apresiasi nilai lahan dan segmentasi komersial di sekitar simpul transit.
- **Fitur Kunci:**
  1. Layer H3 %ΔNJOP Premium hasil Spatial Durbin Model dengan 95% Confidence Interval.
  2. Filter parsel tanah berdasarkan ZNT ATR/BPN vs harga penawaran Properti Go.
  3. Overlay dinamika aktivitas malam (*Nighttime Light*) & kepadatan pengeluaran.
- **User Story:** *"Sebagai Investor, saya ingin memetakan sel H3 dengan proyeksi kenaikan NJOP tertinggi di sekitar Stasiun Wonokromo untuk akuisisi lahan."*

### 2.3 Role 3: Commuter & Local Business / UMKM
- **Fokus:** Menemukan lokasi usaha strategis ramah pejalan kaki dan mengeksplorasi transportasi publik.
- **Fitur Kunci:**
  1. Spatial AI Assistant via natural language chat ("Di mana lokasi ramai dekat stasiun yang cocok buat kedai kopi?").
  2. Peta sebaran keramaian dan kisaran harga kuliner (Menu Go & Struk Go).
  3. Layer integrasi rute feeder WiraWiri / Suroboyo Bus dan titik Community Maps.
- **User Story:** *"Sebagai Pemilik UMKM, saya ingin bertanya ke AI rekomendasi lokasi usaha yang ramai dan sesuai daya beli masyarakat sekitar."*

---

## 3. Dataset & Data Ingestion Pipeline

| Kelompok | Dataset | Sumber | Variabel / Peran dalam Sistem |
| :--- | :--- | :--- | :--- |
| **Data Primer** | Community Maps (Activity) | MAPID Apps | Validasi kondisi trotoar, halte, guiding block (Variabel *Design*) & Data RAG AI |
| | Properti Go | MAPID Apps Mission | Harga penawaran, tipe transaksi (jual/sewa) untuk validasi nilai pasar |
| | Struk Go | MAPID Apps Mission | Nilai transaksi merchant F&B / minimarket (Proksi *People Spending*) |
| | Menu Go | MAPID Apps Mission | Sebaran UMKM kuliner, rentang harga, tingkat keramaian (Variabel *Diversity*) |
| **Data Sekunder** | SES & Demografi | MAPID Catalog | Kepadatan penduduk per kelurahan (Variabel *Density*) |
| | People Spending & NTL | MAPID Catalog | Intensitas *Nighttime Light* & dinamika aktivitas nokturnal |
| | Jaringan Rel & Stasiun | MAPID Catalog | Stasiun SRRL & jaringan rel (Variabel *Distance to Transit*) |
| | Lingkungan (LST & Banjir) | MAPID Catalog | Suhu permukaan & kerentanan banjir (Variabel Kontrol / *Disamenity*) |
| **Data Publik** | ZNT (Zona Nilai Tanah) | ATR/BPN | NJOP Bumi per m² (Variabel terikat model regresi spasial) |
| | Feeder WiraWiri & Bus | Dishub Surabaya | Rute & perhentian bus (Variabel *Transit Connectivity*) |
| | Jaringan Jalan Pedestrian | OpenStreetMap (OSMnx) | Graf pedestrian untuk *Network Buffer Analysis* (0-400m, 400-800m, 800-1000m) |

---

## 4. Survei Lapangan & Koridor Fokus

Survei difokuskan pada 3 simpul transit utama Surabaya beserta jalur penghubungnya:
1. **Koridor Stasiun Surabaya Gubeng** (Hub komersial & transit pusat kota).
2. **Koridor Stasiun Wonokromo & TIJ Joyoboyo** (Hub intermoda selatan & kawasan komersial padat DTC).
3. **Koridor Stasiun Pasar Turi** (Hub transit utara & sentra UMKM / perdagangan).

### Sampel Titik Survei Lapangan Aktual (Ground Truth MAPID Apps)

| Nama Objek | Kategori | Koordinat | Catatan Hasil Lapangan |
| :--- | :--- | :---: | :--- |
| **Klaska Residence** | Properti Komersial | -7.302051, 112.744110 | Hunian mixed-use vertikal pendukung aktivitas ekonomi sekitar stasiun. |
| **Area Pemukiman Stasiun Wonokromo** | Aksesibilitas Pedestrian | -7.302840, 112.738229 | Permukiman padat; butuh penataan trotoar terintegrasi. |
| **JPO DTC Mall - Stasiun Wonokromo** | Aksesibilitas Pedestrian | -7.302840, 112.738229 | Jembatan penyeberangan langsung stasiun ke pusat perbelanjaan. |
| **Tenant Pertokoan Stasiun Wonokromo** | Ekonomi Komersial | -7.302788, 112.738330 | Tenant UMKM retail dalam stasiun target komuter harian. |
| **UMKM Kerajinan Kayu & Mebel** | Ekonomi Komersial | -7.250566, 112.729871 | Sentra UMKM pengrajin kayu on-the-spot dekat Pasar Turi. |
| **Pedestrian Taman Lansia** | Aksesibilitas Pedestrian | -7.271345, 112.750080 | Dilengkapi guiding block & zebra cross; kendala parkir liar. |
| **Bus Stop Taman Lansia B** | Fasilitas Transportasi | -7.271002, 112.750542 | Tiang penanda tanpa atap peneduh & bangku tunggu. |
| **Jalur Pedestrian Stasiun Pasar Turi**| Aksesibilitas Pedestrian | -7.250566, 112.729871 | Belum dilengkapi guiding block ramah difabel. |
| **Bus Stop Manyar Kerta Adi** | Fasilitas Transportasi | -7.280581, 112.782380 | Dekat persimpangan lampu merah; potensi antrean bus. |
| **Gojek Pick Up Point Pasar Turi** | Integrasi Antarmoda | -7.248369, 112.731659 | Titik jemput ojek online resmi mempermudah transfer moda. |
| **Darmo Trade Center (DTC)** | Ekonomi Komersial | -7.302340, 112.738381 | Pusat belanja hibrida (pasar tradisional + modern) dekat stasiun. |
| **Jembatan Sawunggaling (TIJ)** | Fasilitas Publik | -7.299434, 112.736511 | Penghubung pejalan kaki terminal antarmoda Joyoboyo. |
| **Jalur 1-2 Terminal Intermoda TIJ** | Fasilitas Transportasi | -7.299287, 112.736323 | Jalur operasional bus & angkot dengan pos siaga Dishub. |
| **Halte Bus Royal Plaza** | Fasilitas Transportasi | -7.308582, 112.735194 | Halte beratap & berbangku, okupansi tinggi jam sibuk. |
| **Stasiun Gubeng (Lama & Baru)** | Fasilitas Transportasi | -7.265331, 112.749388 | Fasilitas lengkap, ramah difabel, ruang tunggu memadai. |
| **Grand City Mall Surabaya** | Ekonomi Komersial | -7.265331, 112.749388 | Pusat perbelanjaan < 10 menit jalan kaki dari Gubeng. |
| **Bus Stop Sumatera A** | Fasilitas Transportasi | -7.266642, 112.751144 | Titik henti feeder menyatu dengan trotoar pedestrian. |
| **Hotel Sahid Surabaya** | Sarana Ekonomi | -7.266642, 112.751144 | Akomodasi strategis < 5 menit jalan kaki dari Stasiun Gubeng. |
| **Drop Off Ojol Stasiun Gubeng** | Integrasi Antarmoda | -7.264625, 112.752866 | Zona drop-off khusus ojol di pintu keluar stasiun. |

---

## 5. Metodologi Analisis Spasial & AI Engine

### 5.1 Pipeline Analisis Spasial
1. **Network Buffer Analysis:** Menggunakan graf jalan OSMnx untuk membentuk buffer jangkauan jalan kaki riil (0–400m, 400–800m, 800–1.000m) menggantikan radius Euclidean.
2. **Uber H3 Hexagonal Grid (Res 8–9):** Agregasi seluruh data ke unit poligon heksagonal seragam (~0.1 km² pada res 9) guna menghindari MAUP.
3. **AHP 5D TOD Scoring:**
   $$\text{TOD Score} = \sum_{i=1}^{5} w_i \cdot D_i \quad \text{dengan } CR \le 0{,}10$$
   - $D_1$: *Density* (Populasi, NTL, intensitas aktivitas)
   - $D_2$: *Diversity* (Campuran guna lahan & skala harga Menu Go)
   - $D_3$: *Design* (Kualitas trotoar, ramp, guiding block dari data survei & OSMnx)
   - $D_4$: *Destination Accessibility* (Aksesibilitas 15 menit ke POI penting)
   - $D_5$: *Distance to Transit* (Jarak jaringan ke stasiun & halte feeder)
4. **Spatial Durbin Model (SDM) untuk Nilai Lahan:**
   $$Y = \rho W Y + \alpha + X \beta + W X \theta + \varepsilon$$
   - $Y$: %ΔNJOP / Nilai Pasar Properti per m²
   - $X$: TOD Readiness Score + Variabel Kontrol (Risiko Banjir, LST, Jarak CBD)
   - $W$: Matriks pembobotan spasial tetangga H3 (mengukur *spatial spillover*)
5. **Tipologi Kawasan (HDBSCAN + XGBoost):** Klasifikasi 3 klaster kawasan (*Commercial Transit Hub*, *Mixed-Use Residential*, *Low-Accessibility Feeder Zone*).

### 5.2 Arsitektur Integrasi AI (Google Gemini Function Calling)
AI bertindak sebagai **Spatial Intent Parser & Query Dispatcher** (bukan kalkulator koordinat):
- Frontend mengirim kueri bahasa alami pengguna ke Backend FastAPI.
- Gemini API memetakan intent ke Function Call terstruktur (mis. `get_tod_score`, `simulate_scenario`, `filter_layer`).
- Backend mengeksekusi spatial query di PostgreSQL/PostGIS.
- Backend mengembalikan 2 payload:
  1. `json_response`: Perintah manipulasi peta (FlyTo, set filter, highlight H3).
  2. `text_response`: Narasi analitis & rekomendasi kebijakan human-readable.

---

## 6. Matriks Fitur & Acceptance Criteria

| ID | Fitur Produk | Deskripsi & Acceptance Criteria | Prioritas |
| :--- | :--- | :--- | :---: |
| **F-01** | **Peta Interaktif H3 Choropleth** | Render basemap MAPID MAPS (Street/Dark/Satellite) + overlay H3 choropleth skor TOD & %ΔNJOP. Klik sel memunculkan popup atribut 5D. Zoom/pan mulus di desktop & mobile. | P0 |
| **F-02** | **Scorecard & Radar Chart 5D** | Visualisasi radar chart 5 dimensi TOD per stasiun + scorecard numerik indikator terkuat vs terlemah. | P0 |
| **F-03** | **Spatial AI Assistant** | Chatbot terintegrasi bertenaga Google Gemini dengan dukungan Function Calling. Respons < 3 detik, sinkronisasi peta dua arah otomatis, curated prompt shortcuts. | P0 |
| **F-04** | **Simulasi Skenario (What-If)** | Slider/dropdown simulasi penambahan feeder/infrastruktur yang secara instan menghitung perubahan skor TOD & %ΔNJOP baseline vs skenario. | P1 |
| **F-05** | **Peta Distribusi %ΔNJOP** | Layer choropleth kenaikan nilai lahan berbasis SDM lengkap dengan interval kepercayaan 95% dan filter rentang nilai. | P1 |
| **F-06** | **Layer Survey Activities** | Pin interaktif titik survei lapangan (Activity & Mission) dengan popup foto, kategori, dan hasil temuan fisik. | P1 |
| **F-07** | **Multi-Layer Filter & Search** | Pencarian stasiun/lokasi instan + filter multi-kategori (tipologi, rentang skor, status fasilitas). | P1 |
| **F-08** | **Export Ringkasan (PDF/CSV)** | Ekspor ringkasan analisis kawasan per simpul/sel H3 siap unduh. | P2 |
| **F-09** | **Halaman Metodologi & Data** | Dokumentasi ilmiah alur data, rumus AHP/SDM, dan atribusi dataset. | P2 |
| **F-10** | **Mobile Responsiveness & Speed** | Bottom sheet layout pada mobile, touch-friendly UI, FCP < 1.8s, Lighthouse ≥ 85. | P0 |

---

## 7. Persyaratan Teknis & Tech Stack

| Komponen | Spesifikasi Teknologi |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS, Recharts / Lucide Icons |
| **WebGIS Engine** | MapLibre GL JS (WebGL Vector Tiles), MAPID MAPS Basemap API |
| **Backend API** | FastAPI (Python 3.11+), Pydantic v2, Uvicorn |
| **Database & Cache** | PostgreSQL 16 + PostGIS 3.4 (Supabase Managed), Redis (Upstash / In-Memory Cache) |
| **Spatial Data Science** | PySAL (`spreg`), GeoPandas, `h3-py`, OSMnx, Scikit-Learn, XGBoost, HDBSCAN |
| **AI Framework** | Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`), JSON Structured Outputs |
| **Deployment & CI/CD** | Vercel (Frontend), Render (Backend Container), Supabase (DB), GitHub Actions |

---

## 8. Curated Prompts AI Assistant

| No | Prompt Pengguna | Function yang Dipanggil | Aksi Peta & Output |
| :---: | :--- | :--- | :--- |
| 1 | *"Tampilkan skor TOD di sekitar Stasiun Gubeng"* | `get_tod_score(station="gubeng")` | FlyTo Gubeng, render H3 layer, buka scorecard 5D |
| 2 | *"Bandingkan skor TOD Gubeng dan Wonokromo"* | `compare_stations(a="gubeng", b="wonokromo")` | Tampilkan komparasi radar chart 5D & ringkasan selisih |
| 3 | *"Apa dimensi TOD terlemah di Stasiun Pasar Turi?"* | `get_weakest_dimension(station="pasar_turi")` | Highlight dimensi terlemah + rekomendasi intervensi |
| 4 | *"Berapa estimasi kenaikan nilai tanah di sekitar Wonokromo?"* | `get_njop_premium(station="wonokromo")` | Choropleth %ΔNJOP + narasi 95% Confidence Interval |
| 5 | *"Tampilkan lokasi warung makan ramai di dekat stasiun"* | `filter_layer(layer="menu_go", kondisi="ramai")` | Filter titik Menu Go & zoom ke klaster kuliner |
| 6 | *"Jika feeder WiraWiri diperpanjang ke Waru, apa dampaknya?"* | `simulate_scenario(scenario="extend_feeder_waru")` | Kalkulasi delta skor TOD & update visualisasi peta |
| 7 | *"Di mana lokasi terbaik untuk buka kedai kopi dekat stasiun?"* | `site_recommendation(type="coffee_shop")` | Rekomendasi sel H3 berbasis daya beli & keramaian |

---

## 9. Prinsip Keamanan & Privasi

1. **Secret Isolation:** Seluruh API Key (Google Gemini, GEO MAPID) disimpan di environment variable backend (`.env`). Tidak ada kunci yang terekspos di client bundle.
2. **PII Sanitization:** Data survei lapangan Struk Go & Properti Go disanitasi dari nama, nomor telepon, dan plat kendaraan di tahap ETL sebelum masuk ke PostGIS.
3. **Bounding Box Validation:** Backend dan frontend memvalidasi koordinat spasial strictly berada dalam bounding box Surabaya Raya (`112.55` s.d. `112.90` BT, `-7.45` s.d. `-7.15` LS).
4. **Rate Limiting:** Endpoint API dibatasi maksimal 60 request/menit per IP untuk mencegah abuse kuota AI.

---

## 10. Lampiran: Arsitektur Sistem End-to-End

```text
+---------------------------------------------------------------------------------------+
|                               DATA INGESTION & ETL PIPELINE                           |
|  [MAPID Apps: Activity/Struk/Menu] + [MAPID Catalog: SES/NTL/Banjir] + [OSMnx / ZNT]  |
|                                          │                                            |
|                                          ▼                                            |
|                        Data Cleaning, PII Stripping & QC                              |
|                                          │                                            |
|                                          ▼                                            |
|              Spatial Processing: Network Buffer ──> Uber H3 Grid (Res 8-9)            |
|                                          │                                            |
|                                          ▼                                            |
|                   Unified PostGIS Database (Supabase Managed DB)                      |
+------------------------------------------┬--------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
|                        BACKEND SPATIAL & AI ENGINE (FASTAPI)                          |
|                                                                                       |
|  ┌─────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────┐  |
|  │    AHP 5D Engine    │    │ Spatial Durbin Model SDM │    │ HDBSCAN + XGBoost    │  |
|  │ (TOD Score: 0-100)  │    │  (Land Value %ΔNJOP)     │    │ (Typology Clustering)│  |
|  └──────────┬──────────┘    └────────────┬─────────────┘    └──────────┬───────────┘  |
|             └────────────────────────────┼─────────────────────────────┘              |
|                                          ▼                                            |
|                     FastAPI REST & Spatial Query Dispatcher                           |
|                                          │                                            |
|                 ┌────────────────────────┴────────────────────────┐                   |
|                 ▼                                                 ▼                   |
|      [Redis Pre-computed Cache]                [Google Gemini Spatial AI Engine]      |
|                                                (Function Calling & Intent Parser)     |
+------------------------------------------┬--------------------------------------------+
                                           │ HTTPS / JSON API
                                           ▼
+---------------------------------------------------------------------------------------+
|                         FRONTEND USER INTERFACE (NEXT.JS 15)                          |
|                                                                                       |
|  ┌───────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  |
|  │  Interactive Map      │  │  Dashboard & Scorecard  │  │   Spatial AI Assistant  │  |
|  │  MapLibre GL JS       │  │  Radar Chart 5D TOD,    │  │   Natural Language Chat,│  |
|  │  Uber H3 Choropleth,  │  │  What-if Simulation,    │  │   Bi-directional Map    │  |
|  │  MAPID Vector Basemap │  │  Weakest Dim Indicator  │  │   Sync & Query Handler  │  |
|  └───────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  |
+---------------------------------------------------------------------------------------+
```
