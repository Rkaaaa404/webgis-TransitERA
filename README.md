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
- Business: Fokus pada *tenant mix*, keramaian (Activity Data MAPID), dan estimasi kenaikan NJOP lahan komersial.
- Commuter: Fokus pada integrasi rute feeder, *Menu Go* (POI sekitar stasiun), dan estimasi waktu tempuh.

---

## 🛠️ Arsitektur Teknologi

### Frontend (User Interface & Map Client)
- **Framework:** Next.js 16 (App Router) + React 19
- **Map Engine:** MapLibre GL JS + MAPID MAPS Basemap
- **Styling:** Tailwind CSS + Framer Motion (untuk animasi *Mission Control*)
- **Data Visualizations:** Recharts (Radar Chart & Gauge)

### Backend (Spatial Engine & AI)
- **Framework:** FastAPI (Python)
- **Geospatial Processing:** PostGIS, `h3-py`, `shapely`, `geopandas`, `osmnx`
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
