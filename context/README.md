# Directory Context: MAPID WebGIS Competition 2026

Direktori ini berisi seluruh dokumen referensi, panduan kompetisi, notulensi teknis, katalog data, proposal, dan arsip submission. Direktori ini diisolasi dari direktori aplikasi (`webdev/`) agar proses *coding* dan *prompting* AI tetap bersih dari *token bloat*.

---

## 📂 Struktur Direktori Context

```
context/
├── guidelines/               # Panduan resmi kompetisi & aturan MAPID
│   ├── MAPID_WebGIS_Competition_2026_Guide.md
│   ├── Ketentuan Data & WebGIS  - MAPID WebGIS Competition 2026.md
│   ├── Panduan_Survey_Activities_MAPID_WebGIS_Competition_2026.docx.md
│   ├── Template_PRD_MAPID_WebGIS_Competition_2026.md
│   └── MAPID_Documentation_Reference.md
│
├── notulensi/                # Notulensi sesi coaching & technical meeting
│   ├── notulensi-PRD.md / .pdf          (Coaching 1: Penyusunan PRD)
│   ├── notulensi-TM2.md / .pdf          (Technical Meeting 2: Ketentuan Teknis)
│   ├── notulensi-AI.md / .pdf           (Coaching 2: Ekspektasi & Pemanfaatan AI)
│   ├── notulensi-Industri.md / .pdf     (Coaching 3: Industry Demand & VPC)
│   └── raw_transcripts/                 (Arsip transcript mentah ASR / speech-to-text)
│       ├── notulensi-PRD.txt
│       ├── notulensi-TM2.txt
│       ├── notulensi-AI.txt
│       └── notulensi-Industri.txt
│
├── proposal_and_survey/      # Dokumen resmi yang dikumpulkan (submission archive)
│   ├── PRD_Submitted_MAPID_2026.md       (Arsip PRD yang dikumpulkan ke panitia)
│   └── Rencana_Survey_Activities_Pak_Sibuk_Ga.md / .pdf (Rencana survei lapangan Form A)
│
├── catalog_and_sample/       # Katalog data MAPID & sampel dataset
│   ├── MAPID_Data_Catalog.csv / .md
│   └── data-sample/
│       ├── Properti Go Bandung.geojson
│       ├── Sample_Activity_WebGIS2026.geojson
│       ├── Sample_MenuGo_WebGIS2026.csv
│       └── Sample_StrukGo_WebGIS2026.csv
│
├── past-idea/                # Arsip ide awal & draft proposal lawas
│   ├── Proposal_Final_MAPID_WebGIS.md
│   ├── Proposal_Final_MAPID_WebGIS_2026.md
│   ├── proposal_draft_ide_1.md
│   ├── masukan.txt
│   ├── webGIS.txt
│   └── webgis_past-comp.md
│
└── scripts/                  # Helper scripts dokumentasi
    └── generate_pdfs.py
```

---

## 🧭 Panduan Akses Cepat untuk AI / Developer

| Kebutuhan Informasi | Dokumen Rujukan Utama |
| :--- | :--- |
| **Living PRD Master (Vibe Coding)** | `docs/prd/TransitERA_PRD.md` |
| **Pusat Dokumentasi Proyek** | `docs/README.md` |
| **Arsip PRD Resmi yang Dikumpulkan** | `context/proposal_and_survey/PRD_Submitted_MAPID_2026.md` |
| **Aturan & Kriteria Penilaian WebGIS** | `context/guidelines/MAPID_WebGIS_Competition_2026_Guide.md` |
| **Panduan & Standar Data Spasial MAPID** | `context/guidelines/Ketentuan Data & WebGIS  - MAPID WebGIS Competition 2026.md` |
| **Panduan Survei MAPID APPS (Activity/Mission)** | `context/guidelines/Panduan_Survey_Activities_MAPID_WebGIS_Competition_2026.docx.md` |
| **Arsitektur & Integrasi AI (Function Calling)** | `context/notulensi/notulensi-AI.md` & `docs/prd/TransitERA_PRD.md` |
| **Rencana & Sampel Titik Survei Lapangan** | `context/proposal_and_survey/Rencana_Survey_Activities_Pak_Sibuk_Ga.md` |
| **Daftar Dataset & Skema Atribut MAPID** | `context/catalog_and_sample/MAPID_Data_Catalog.md` |
| **Spesifikasi Responsif & Desain Mobile** | `docs/prd/TransitERA_Responsive_PRD.md` |
| **Spesifikasi Keamanan & Threat Model** | `docs/prd/TransitERA_Security_PRD.md` |
| **Roadmap & Audit Kesiapan M1-M8** | `docs/roadmap/TRANSITERA_AUDIT_AND_ROADMAP.md` |
