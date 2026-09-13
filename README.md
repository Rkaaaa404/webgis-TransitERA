# 🚆 TransitERA WebGIS
**MAPID WebGIS Competition 2026 Submission**

![TransitERA Preview](webdev/frontend/public/assets/landing/LOGO.png)

TransitERA adalah platform WebGIS analitik berbasis **Kecerdasan Buatan (Spatial AI)** dan **Ekonometrika Spasial** untuk mengukur, memprediksi, dan mengoptimalkan kawasan *Transit-Oriented Development* (TOD) di Surabaya Raya. Platform ini dirancang untuk menjembatani kesenjangan informasi antara tiga pilar utama pembangunan kota: **Pemerintah**, **Investor/Bisnis**, dan **Masyarakat/Komuter**.

---

## ✨ Fitur Utama

### 1. Spatial Engine & 5D TOD Scoring
TransitERA tidak menggunakan radius lingkaran konvensional, melainkan **H3 Hexagonal Grid (Resolusi 8 & 9)** dari Uber untuk partisi spasial yang presisi. Kami mengukur *TOD Readiness Score* (0-100) menggunakan **Analytic Hierarchy Process (AHP)** pada 5 Dimensi Utama (5D):
- **Density:** Kepadatan penduduk & intensitas bangunan.
- **Diversity:** Percampuran guna lahan (*Land Use Mix*).
- **Design:** Kualitas jalur pedestrian & *walkability index* (berbasis OSMnx).
- **Destination:** Aksesibilitas dalam 15 menit.
- **Distance to Transit:** Jarak ke simpul SRRL dan Feeder WiraWiri.

### 2. Spatial Durbin Model (SDM) untuk Prediksi Nilai Tanah
TransitERA tidak hanya mengukur infrastruktur, tapi juga potensi ekonomi. Menggunakan ekonometrika spasial (SDM via PySAL), platform ini memprediksi **% Kenaikan Nilai Jual Objek Pajak (NJOP Premium)** dari sebuah parsel tanah akibat efek langsung (*direct effect*) dan efek limpahan tata ruang tetangga (*spatial spillover*).

### 3. Machine Learning TOD Typology Classifier (Unsupervised Clustering + PCA)
Model klasifikasi tipologi kawasan transit *data-driven* yang bebas dari bias pelabelan subjektif. Menggabungkan 5 indikator spasial (densitas populasi, radiansi NTL, sebaran halte feeder, kedekatan stasiun KA, risiko banjir) pada 492 sel Uber H3 Resolusi 9 di Surabaya, diproyeksikan ke ruang laten PCA (variansi terjelaskan **93.23%**), dan diklasterkan secara *unsupervised* (K-Means $k=4$) untuk menghasilkan 4 tipologi kawasan TOD empiris (*Commercial Transit Hub*, *Mixed-Use Residential Area*, *Mixed-Use Heritage Core*, *Low-Accessibility Feeder Zone*). Dilengkapi model Random Forest dan generator rekomendasi zonasi adaptif.

### 4. Asisten Spatial AI (Gemini)
Dilengkapi dengan asisten obrolan cerdas bertenaga Google Gemini. AI ini memahami konteks spasial (RAG), mampu menjawab pertanyaan terkait kelayakan investasi stasiun tertentu, membandingkan antar-koridor, dan **secara otomatis menggerakkan viewport peta (FlyTo)** serta mengubah *layer* sesuai instruksi pengguna.

### 5. Tri-Persona Dashboard
Tampilan dan alat analisis disesuaikan untuk 3 persona spesifik:
- Government: Fokus pada *policy recommendations*, pendeteksian titik buta pejalan kaki, dan skor TOD per stasiun.
- Business: Fokus pada *tenant mix*, keramaian (Activity Data MAPID), evaluasi kelayakan usaha via *Retail Success Score*, dan estimasi kenaikan NJOP lahan komersial.
- Commuter: Fokus pada integrasi rute feeder, *Menu Go* (POI sekitar stasiun), dan estimasi waktu tempuh.

### 6. Analisis Keterjangkauan "15-Minute City" (Isochrone Network Map)
Menggantikan model *buffer* udara garis lurus konvensional dengan pemodelan jangkauan jaringan jalan riil (*street network isochrone*) yang memperhitungkan sirkuitas jalan, persimpangan, dan hambatan kanal sungai Kota Surabaya:
- **Pilihan Moda:** Jalan Kaki (kecepatan rata-rata 4.5 km/h), Sepeda Motor / Ojol (24.0 km/h), dan Mobil / Taksi Online (18.5 km/h).
- **Pilihan Durasi Tempuh:** 5 Menit, 10 Menit, dan 15 Menit.
- **Komparasi Spasial:** Poligon isochrone dapat ditumpuk (*overlay*) dengan layer sel H3 Resolusi 9 untuk membedakan secara tegas area yang benar-benar terjangkau dalam 15 menit berjalan kaki versus area yang hanya dekat secara radius geometris semata.

### 7. Metodologi & Spesifikasi Retail Success Score (Beta v1.2)
Indikator analitik multi-kriteria transparan yang dirancang khusus untuk mengevaluasi kelayakan sektor **Retail Komuter & Convenience F&B** (minimarket transit, kedai kopi *to-go*, *quick service restaurant*, apotek/toko kebutuhan harian) di radius simpul transit stasiun:
- **Formula Pembobotan Spasial:**
  $$\text{Retail Score} = (0.30 \times \text{Foot Traffic (NTL \& POI)}) + (0.25 \times \text{Akses Transit}) + (0.20 \times \text{Densitas Warga}) + (0.15 \times \text{Diversitas Lahan}) + (0.10 \times \text{Daya Beli SES})$$
- **Sumber Data Terverifikasi:**
  1. *MAPID Spatial Catalog*: Titik aktivitas survei lapangan & sebaran pusat perbelanjaan.
  2. *NOAA VIIRS Nighttime Lights (NTL)*: Proxy radiansi pencahayaan malam 500m Surabaya.
  3. *BPS Kota Surabaya*: Statistik kependudukan & profil sosial ekonomi (SES) per kecamatan.
  4. *OpenStreetMap & Dishub Surabaya*: Jaringan pedestrian & rute transit feeder WiraWiri.
- **Transparansi UI:** Dilengkapi tombol info interaktif, visualisasi *variable breakdown bar*, dan badge resmi `Beta v1.2`.

### 8. Integrasi Tata Ruang & Kadaster Resmi ATR/BPN (GISTARU & BHUMI)
TransitERA mengintegrasikan layer tata ruang dan pertanahan nasional langsung dari portal resmi Kementerian Agraria dan Tata Ruang/Badan Pertanahan Nasional (ATR/BPN):
- **GISTARU RTR Online (Pola Ruang RTRW Surabaya):** Memvisualisasikan rencana tata ruang wilayah Kota Surabaya (Perda No. 8 Tahun 2024) per koridor stasiun dengan kode warna zonasi resmi (Zona Perumahan, Perdagangan & Jasa, Sarana Pelayanan Umum, Ruang Terbuka Hijau, Kawasan Peruntukan Industri, dll.).
- **BHUMI ATR/BPN (Kadaster Persil Tanah):** Memetakan batas-batas persil bidang tanah kadaster resmi di sekitar simpul transit untuk verifikasi kepemilikan, luas bidang, dan batas yuridis lahan investasi TOD.

### 9. Multi-Modal Transit Route Planner
Routing engine berbasis graf keterhubungan transit lokal yang menghubungkan 13 stasiun kereta komuter dengan koridor Suroboyo Bus dan angkutan pengumpan (Feeder WiraWiri Suroboyo):
- **Multi-Hop Pathfinding:** Pencarian jalur transit optimal dari stasiun asal ke stasiun tujuan lengkap dengan titik transfer, estimasi waktu tempuh, dan panduan langkah demi langkah.
- **Visualisasi Dinamis:** Highlight interaktif pada rute aktif di atas peta dengan efek glow dan reduksi otomatis pada rute non-aktif.

---

## 🛠️ Arsitektur Teknologi

### Frontend (User Interface & Map Client)
- **Framework:** Next.js 16 (App Router) + React 19
- **Map Engine:** MapLibre GL JS 4.7.1 + MAPID MAPS Basemap (Street 3D, Street 2D, Dark, Light, Satellite)
- **Cartographic Precision:** Native WebGL GeoJSON Circle & Symbol layers untuk sinkronisasi sub-pixel penanda stasiun pada semua level zoom (bebas jitter DOM overlay).
- **Official Attribution:** Terintegrasi resmi melalui `AttributionControl` dengan atribusi MAPID, CARTO, dan OpenStreetMap yang responsif/collapsible di perangkat mobile.
- **Styling:** Tailwind CSS 4 + Lucide Icons (Strict Anti-Unicode Emoji standard)
- **Data Visualizations:** Recharts (Radar Chart & Gauge)

### Backend (Spatial Engine & AI)
- **Framework:** FastAPI (Python 3.12+)
- **Geospatial Processing:** PostGIS, `h3-py` (Uber H3 Resolusi 8 & 9), `shapely`, `geopandas`, `osmnx`
- **Spatial Deduplication:** *Tie-breaking proximity algorithm* yang menjamin partisi sel H3 eksklusif non-overlapping pada perbatasan antar-stasiun.
- **Isochrone Engine:** Pre-computed road network isochrone matrix (15 stasiun $\times$ 3 moda $\times$ 3 durasi waktu) disajikan via endpoint `/api/isochrone`.
- **Machine Learning:** Scikit-learn (PCA, K-Means, Random Forest, KNN)
- **Econometrics:** PySAL (`spreg` - Spatial Durbin Model)
- **AI Integration:** Google Gemini API (*Function Calling*)

---

## 📂 Struktur Repositori

```
TransitERA/
├── docs/                     # Pusat dokumentasi resmi (PRD, roadmap, deployment, design)
│   ├── README.md             # Indeks utama dokumentasi
│   ├── DEPLOYMENT_GUIDE.md   # Panduan deployment cloud (Vercel & Supabase)
│   ├── prd/                  # Master PRD, spesifikasi responsif & keamanan
│   ├── roadmap/              # Roadmap pengembangan & audit kesiapan
│   └── design/               # Design token & panduan antarmuka
├── notebooks/                # Jupyter Notebooks riset spasial & machine learning pre-rendered
│   ├── TransitERA_H3_Spatial_ML_Typology_Classifier.ipynb  # H3 Unsupervised Clustering, PCA, Radar Chart
│   └── TransitERA_Station_Clustering_and_Regression.ipynb  # Station K-Means & SDM Econometric Regression
├── webdev/                   # Workspace kode aplikasi
│   ├── frontend/             # Next.js 16 + React 19 + MapLibre GL JS
│   ├── backend/              # FastAPI + Uber H3 + Scikit-learn + PySAL SDM + Gemini AI
│   └── docker-compose.yml    # Orkestrasi container dev
├── context/                  # Arsip riset, notulensi coaching, katalog data MAPID
├── scripts/                  # Helper script (model training, notebook generation, secret scanning, sync)
├── docker-compose.yml        # Orkestrasi stack production
├── AGENTS.md                 # Aturan koding & standar repository
└── README.md                 # Ikhtisar proyek ini
```

---

## 📖 Dokumentasi Lengkap

Seluruh dokumentasi teknis dan arsitektur produk telah dikonsolidasikan di dalam direktori [`docs/`](file:///docs/README.md):
- **[Master PRD](file:///docs/prd/TransitERA_PRD.md)**: Konsep inti, scoring 5D TOD, dan tri-persona dashboard.
- **[Responsive Design PRD](file:///docs/prd/TransitERA_Responsive_PRD.md)**: Standar responsif smartphone hingga ultrawide.
- **[Security PRD](file:///docs/prd/TransitERA_Security_PRD.md)**: Threat model dan perlindungan API key / PII.
- **[Roadmap & Audit](file:///docs/roadmap/TRANSITERA_AUDIT_AND_ROADMAP.md)**: Milestone M1-M8 dan kesiapan kompetisi.
- **[Panduan Deployment](file:///docs/DEPLOYMENT_GUIDE.md)**: Cara deploy ke Vercel dan Supabase PostGIS.

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan Docker Compose (Direkomendasikan)
```bash
cd webdev
copy .env.example .env   # Di Linux/macOS gunakan: cp .env.example .env
docker compose up --build
```
Akses layanan:
- 🌐 **Frontend WebGIS**: [http://localhost:3030](http://localhost:3030)
- 🔌 **Backend API**: [http://localhost:8000](http://localhost:8000) (Swagger docs di `/docs`)
- 🗄️ **PostGIS Database**: `localhost:5432`

---

### Opsi 2: Menjalankan Secara Manual

#### 1. Menjalankan Backend
```bash
cd webdev/backend
python -m venv .venv
# Aktivasi venv (Windows: .\.venv\Scripts\Activate.ps1 | Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Menjalankan Frontend
```bash
cd webdev/frontend
npm install
npm run dev
```
Aplikasi frontend akan berjalan di [http://localhost:3030](http://localhost:3030).

---

## 📄 Lisensi & Kredit
Dibangun dengan 💚 untuk **MAPID WebGIS Competition 2026**.
Data spasial (Basemap, Activity, Menu Go) disediakan oleh **MAPID GEO API**.
