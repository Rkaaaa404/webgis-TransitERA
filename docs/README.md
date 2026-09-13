# 📚 TransitERA Documentation Center

Selamat datang di pusat dokumentasi resmi **TransitERA WebGIS** (*MAPID WebGIS Competition 2026*). Direktori ini mengorganisir seluruh spesifikasi teknis, arsitektur, panduan deployment, dan roadmap proyek agar terstruktur rapi dan mudah ditelusuri.

---

## 🧭 Peta Navigasi Dokumentasi

```
docs/
├── README.md                      # Pusat indeks dokumentasi ini
├── DATA_ACQUISITION_AND_REVERSE_ENGINEERING.md # Metodologi scraping, reverse-engineering API BHUMI/GISTARU, & kadaster
├── DEPLOYMENT_GUIDE.md            # Panduan deployment cloud (Vercel, Supabase PostGIS, Azure)
│
├── prd/                           # Product Requirement Documents (PRD)
│   ├── TransitERA_PRD.md          # Living Master PRD (Konsep 5D TOD, persona, fitur utama)
│   ├── TransitERA_Responsive_PRD.md # Spesifikasi RWD & mobile bottom-sheet
│   └── TransitERA_Security_PRD.md # Standar keamanan, sanitasi API key, PII & threat model
│
├── roadmap/                       # Rencana pengembangan & audit kelayakan
│   └── TRANSITERA_AUDIT_AND_ROADMAP.md # Milestone M1-M8, audit rubric, status implementasi
│
└── design/                        # Desain sistem & panduan antarmuka
    └── DESIGN.md                  # Desain token, palet warna, tipografi, dan UI flow
```

---

## 📑 Rincian Dokumen

### 1. Data Pipeline & Reverse Engineering (`docs/`)
* **[Data Acquisition & Reverse Engineering Guide](file:///docs/DATA_ACQUISITION_AND_REVERSE_ENGINEERING.md)**: Dokumentasi komprehensif mengenai teknik reverse-engineering API terenkripsi BHUMI ATR/BPN (dekripsi AES-128-CBC CryptoJS `s3CRetCR1pT0`), ekstraksi 4.393 poligon RDTR GISTARU Perda No. 8/2018, metodologi subdivisi kadaster 648 persil, serta integrasi OSRM & MAPID Geo API.

### 2. Product Requirements Documents (`docs/prd/`)
* **[TransitERA Master PRD](file:///docs/prd/TransitERA_PRD.md)**: Dokumen induk yang menjabarkan latar belakang masalah komuter Surabaya Raya, arsitektur Uber H3 (res 8 & 9), scoring AHP 5D TOD, prediksi Spatial Durbin Model (SDM), dan persona dashboard (Government, Business, Commuter).
* **[Responsive Design PRD](file:///docs/prd/TransitERA_Responsive_PRD.md)**: Panduan tata letak adaptif dari mobile smartphone hingga monitor ultrawide, mencakup interaksi mobile bottom-sheet dan navigasi 1-tap.
* **[Security & Hardening PRD](file:///docs/prd/TransitERA_Security_PRD.md)**: Spesifikasi isolasi API key (Gemini & MAPID di FastAPI proxy), anonimisasi data PII survei, bounding box query limiter, dan secret scanning.

### 3. Roadmap & Audit (`docs/roadmap/`)
* **[TransitERA Audit & Roadmap](file:///docs/roadmap/TRANSITERA_AUDIT_AND_ROADMAP.md)**: Rencana kerja 5.5 minggu (Milestone M1 hingga M8), matriks kesiapan fitur kompetisi, serta checklist kepatuhan terhadap rubrik penilaian MAPID 2026.

### 4. Panduan Deployment (`docs/`)
* **[Deployment Guide](file:///docs/DEPLOYMENT_GUIDE.md)**: Petunjuk konfigurasi cloud free-tier dan student pack (Supabase PostgreSQL 16 + PostGIS, Vercel frontend, FastAPI backend container).

### 5. Design System (`docs/design/`)
* **[Design System & Specifications](file:///docs/design/DESIGN.md)**: Panduan visual identitas, palet warna, tipografi, radius sudut, serta hierarki komponen UI.

---

## 🏛️ Konteks Riset & Arsip (`context/`)
Untuk arsip notulensi coaching juri, ketentuan kompetisi, survei lapangan, dan katalog dataset, silakan merujuk ke:
* **[Context Directory Hub](file:///context/README.md)**: Berisi panduan resmi lomba, notulensi coaching 1–3, rencana survei lapangan, dan dataset sampel MAPID.
