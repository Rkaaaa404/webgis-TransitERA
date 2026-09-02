# TransitERA WebGIS — Technical Audit & Execution Roadmap
**Master Plan & Task Tracker for Competition-Grade Implementation**

Dokumen ini merupakan panduan kerja dan pelacak task terstruktur (*living checklist*) untuk menyempurnakan TransitERA WebGIS menuju standar penilaian tertinggi MAPID WebGIS Competition 2026.

---

## Ringkasan Eksekutif Hasil Audit Senior Engineer

| Area Audit | Temuan Kritis | Dampak | Solusi Terpilih |
| :--- | :--- | :--- | :--- |
| **H3 Grid Engine** | Sel H3 dibuat via aproksimasi matematika trigonometri dengan string palsu `8965e...`. | Grid tidak akurat dan tidak kompatibel dengan standar H3 Uber. | Menggunakan library resmi `h3-py` resolusi 9 (`h3.geo_to_h3`, `h3.k_ring`, `h3.h3_to_geo_boundary`). |
| **Data Survei** | API MAPID fallback ke titik acak. Dataset 100 titik survei riil tim (Wonokromo, Pasar Turi, Gubeng) belum termuat. | Data lapangan tidak tampil maksimal saat offline/evaluasi. | Mengingesti dataset 100 titik survei riil `#PakSibukGa` hasil download GeoJSON/CSV ke `surabaya_ground_truth.json` & PostGIS. |
| **Database Spasial** | `schema.sql` dan `models.py` belum terkoneksi ke runtime FastAPI. | Data tidak persisten dan tidak dapat dilakukan query spasial PostGIS live. | Menambahkan `app/db/database.py` (Dual-Mode: PostGIS live + in-memory fallback) dan script seeding. |
| **Model AI & Analytics** | Tipologi menggunakan `if/else` kasar; SDM regression menggunakan koefisien pengali sederhana. | Nilai ilmiah dan metodologi ekonometrika spasial berkurang di mata juri. | Mengimplementasikan model klasifikasi tipologi terkalibrasi dan ekonometrika spasial SDM dengan direct & spillover effects. |
| **AI Assistant** | Gemini API disiapkan menggunakan **Paid Tier** (kuota aman, tanpa limit 15 RPM). | Kecepatan dan keandalan tinggi saat presentasi/penjurian. | Mengoptimalkan prompt model `gemini-1.5-flash` / `gemini-2.0-flash` dan memperkaya 7 curated prompts PRD. |
| **Arsitektur Deployment** | Render free tier mengalami *cold-start* 50 detik; Supabase belum diset. | Juri mengira aplikasi rusak/lambat saat pertama kali dibuka. | Memanfaatkan benefit mahasiswa ITS (Azure for Students $100 kredit gratis) atau Hugging Face Spaces (Always ON) + Supabase PostGIS + Vercel. |

---

## Roadmap Pelaksanaan Berfase (Horizontal / Vertical Slices)

Setiap fase wajib melewati:
1. Automated Test (`pytest` & `vitest`).
2. Type & Build Check.
3. **Manual QC oleh User**.
4. Git Commit dengan **Conventional Commits**.

---

### [x] FASE 1: Fondasi Data Riil Spasial & Library Uber H3
- [x] **Task 1.1**: Migrasi `app/spatial/h3_grid.py` ke library `h3-py`. Hasilkan indeks H3 valid (misal: `898d80835d3ffff`) dan batas poligon GeoJSON presisi.
- [x] **Task 1.2**: Audit katalog dataset MAPID Surabaya (140 dataset Surabaya & 21 Jatim tercatat di `MAPID_Surabaya_EastJava_Catalog.md`).
- [x] **Task 1.3**: Perbarui `app/api/endpoints.py`, `dispatcher.py`, dan frontend `BusinessSiteProfile.tsx` agar mengonsumsi indeks H3 resolusi 9 resmi.
- [x] **Task 1.4**: Jalankan unit test `tests/test_h3.py` (27/27 Pytest passed).
- **Git Commit Target**: `feat(spatial): integrate real h3-py resolution 9 indexing and mapid surabaya dataset catalog` *(Committed: ef2db7c)*

---

### [x] FASE 2: Integrasi Database PostGIS (Dual-Mode: Live Supabase / In-Memory Fallback)
- [x] **Task 2.1**: Tambahkan `sqlalchemy>=2.0.0`, `psycopg2-binary>=2.9.0`, `geoalchemy2>=0.14.0` ke `requirements.txt`.
- [x] **Task 2.2**: Bangun `app/db/database.py` dengan connection pooling, auto-detect PostGIS live, dan helper status kesehatan.
- [x] **Task 2.3**: Buat `app/db/seeder.py` untuk menginjeksi 5 stasiun SRRL Surabaya dan 95 sel Uber H3 resolusi 9 ke tabel PostGIS.
- [x] **Task 2.4**: Implementasikan arsitektur *Dual-Mode Repository* di `endpoints.py`: jika PostGIS terhubung baca dari DB, jika offline fallback otomatis ke in-memory.
- [x] **Task 2.5**: Tambahkan endpoints `/api/db/status` dan `POST /api/db/seed` serta perbarui root `/health`.
- [x] **Task 2.6**: Jalankan unit test `tests/test_db.py` (32/32 Pytest passed).
- **Git Commit Target**: `feat(db): implement dual-mode postgis spatial repository and automated seeding`

---

### [ ] FASE 3: Model AI Nyata (Klasifikasi Tipologi ML & Ekonometrika Spasial SDM)
- [ ] **Task 3.1**: Bangun script training/kalibrasi `scripts/train_spatial_models.py` untuk klasifikasi tipologi kawasan TOD dan matriks pembobotan spasial ($W$) SDM.
- [ ] **Task 3.2**: Refactor `app/spatial/h3_grid.py` untuk mengintegrasikan model klasifikasi tipologi berbasis bobot fitur 5D yang terkalibrasi.
- [ ] **Task 3.3**: Refactor `app/analytics/sdm_regression.py` untuk menghitung Spatial Durbin Model nyata dengan dekomposisi Direct Effect, Spatial Lag Spillover ($WY$), dan 95% Confidence Interval.
- [ ] **Task 3.4**: Uji dan verifikasi akurasi matematis serta sinkronisasi endpoint `/api/analytics/*`.
- **Git Commit Target**: `feat(analytics): upgrade typology classifier and spatial durbin regression models`

---

### [ ] FASE 4: Penyempurnaan AI Assistant & Integrasi Sinkronisasi Frontend
- [ ] **Task 4.1**: Sempurnakan `app/ai/dispatcher.py` dan `app/ai/gemini_proxy.py` dengan model terbaru (`gemini-1.5-flash` / `gemini-2.0-flash`) dan data enricher dinamis.
- [ ] **Task 4.2**: Perbaiki `webdev/frontend/src/lib/api.ts` agar menangani respons backend secara konsisten (mengatasi bug field `summary.scores`).
- [ ] **Task 4.3**: Uji integrasi end-to-end: UI MapLibre GL JS, H3 choropleth nyata, radar chart 5D, dan popup survei PRD.
- [ ] **Task 4.4**: Verifikasi `pytest` backend lulus + `vitest` frontend lulus.
- **Git Commit Target**: `feat(ai-frontend): align gemini spatial intent dispatcher and fix frontend api sync`

---

### [ ] FASE 5: Konfigurasi Deployment Free Tier / Student & Dokumentasi Lengkap
- [ ] **Task 5.1**: Siapkan konfigurasi deployment: `vercel.json`, Dockerfile backend teroptimasi (multistage slim), serta panduan langkah demi langkah setup Supabase & Azure for Students.
- [ ] **Task 5.2**: Buat dokumen panduan deployment komprehensif di `docs/DEPLOYMENT_GUIDE.md` yang merinci cara klaim GitHub Student Developer Pack bagi mahasiswa ITS dan konfigurasi env production.
- [ ] **Task 5.3**: Jalankan security scan (`scripts/scan-secrets.js`) dan verifikasi sanitasi API key.
- **Git Commit Target**: `chore(deploy): add deployment configs for vercel supabase and student cloud guide`

---

## Ringkasan Benefit Mahasiswa ITS untuk Deployment

1. **GitHub Student Developer Pack**:
   - Pendaftaran via email `@student.its.ac.id` atau upload bukti KTM di GitHub Education.
   - **Microsoft Azure for Students**: Gratis $100 kredit/tahun tanpa kartu kredit. Sangat ideal untuk backend container aktif 24/7 tanpa cold-start.
   - **DigitalOcean**: Kredit $200 (1 tahun) jika ingin meng-host seluruh stack via single Docker VPS.
   - **Domain Gratis**: Namecheap/Name.com 1 tahun domain `.me` / `.live`.
2. **Supabase Free Tier**:
   - PostgreSQL 16 + PostGIS 3.4 gratis (500 MB). Cukup untuk jutaan koordinat dan ribuan heksagon H3.
3. **Vercel Hobby Tier**:
   - Hosting Next.js terbaik di dunia, 100% gratis, zero-config CI/CD.
4. **Google AI Studio (Gemini 1.5/2.0 Flash)**:
   - 15 RPM / 1500 RPD gratis tanpa kartu kredit.
