# Panduan Deployment Cloud TransitERA WebGIS (Free Tier & Student Benefits)

Dokumen ini merupakan panduan deployment teknis resmi untuk tim pengembang TransitERA WebGIS. Panduan ini dirancang khusus untuk memaksimalkan **layanan *Free Tier* permanen** dan **manfaat mahasiswa Indonesia (terutama Institut Teknologi Sepuluh Nopember / ITS)** tanpa memerlukan biaya operasional server.

---

## 1. Arsitektur Komponen Deployment

TransitERA WebGIS mengadopsi arsitektur *Decoupled Cloud Native*:

```mermaid
graph TD
    User([Pengguna / Juri MAPID]) -->|HTTPS| Vercel[Vercel Global CDN<br/>Next.js 15 Frontend]
    Vercel -->|REST API Calls| Backend[Azure Container Apps / Hugging Face<br/>FastAPI Spatial Engine]
    Backend -->|PostGIS SQL| Supabase[(Supabase PostgreSQL 16<br/>PostGIS Spatial Database)]
    Backend -->|JSON Function Calling| Gemini[Google Gemini AI API<br/>Spatial Assistant]
    Backend -->|Tile & Basemap| MapID[MAPID MAPS Basemap Service<br/>Street 3D / Dark / Light]
```

---

## 2. Pemanfaatan Benefit Mahasiswa ITS (GitHub Student Pack & Azure)

Sebagai mahasiswa ITS, Anda berhak mendapatkan fasilitas cloud gratis bernilai ribuan dolar melalui akun email kampus:

### A. Pendaftaran GitHub Student Developer Pack
1. Kunjungi [GitHub Education](https://education.github.com/pack).
2. Masuk menggunakan akun GitHub pribadi Anda, lalu tambahkan email resmi ITS Anda (`@student.its.ac.id` atau `@*.its.ac.id`) pada pengaturan akun.
3. Unggah bukti status mahasiswa aktif (Kartu Tanda Mahasiswa / KTM atau tangkapan layar SIAKAD / myITS).
4. Verifikasi biasanya disetujui dalam 1x24 jam.

### B. Klaim Microsoft Azure for Students ($100 USD Kredit Tanpa Kartu Kredit)
1. Setelah GitHub Student Pack aktif, buka [Azure for Students](https://azure.microsoft.com/en-us/free/students/).
2. Masuk menggunakan akun Microsoft atau tautkan akun GitHub Student Anda.
3. Anda akan mendapatkan saldo **$100 USD kredit aktif per tahun** yang dapat diperpanjang setiap tahun selama berstatus mahasiswa aktif.
4. Saldo ini sangat cukup untuk menjalankan:
   - **Azure Container Apps** (serverless container backend FastAPI).
   - Atau **Azure Virtual Machine B1s/B2s** (Linux Ubuntu untuk Docker Compose full stack).

### C. Klaim Domain Kustom Gratis (1 Tahun)
1. Melalui GitHub Student Pack, klaim voucher domain dari:
   - **Namecheap**: 1 domain gratis `.me` (misal: `transitera.me`).
   - Atau **Name.com**: 1 domain gratis `.tech` (misal: `transitera.tech`).
2. Domain ini dapat langsung diarahkan (*CNAME record*) ke Vercel untuk memberikan kesan profesional saat dipresentasikan kepada dewan juri kompetisi GEO MAPID 2026.

---

## 3. Deployment Database Spasial: Supabase PostGIS (100% Free)

Supabase menyediakan database PostgreSQL 500 MB gratis permanen yang sudah mendukung ekstensi PostGIS.

### Langkah Setup:
1. Buka [Supabase Dashboard](https://supabase.com/) dan buat project baru (misal: `transitera-prod`).
2. Pilih region terdekat: **Singapore (ap-southeast-1)** untuk latensi terendah ke Surabaya (< 30 ms).
3. Setelah database aktif, masuk ke menu **SQL Editor** dan jalankan perintah berikut untuk mengaktifkan fitur geospasial:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
4. Buka **Project Settings** -> **Database**, salin *Connection String URI* (bagian Connection Pooling atau Direct Connection).
   Contoh format:
   ```
   postgresql://postgres.xxxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. Simpan URL ini untuk dimasukkan ke variabel lingkungan `DATABASE_URL` backend.
6. Backend TransitERA secara otomatis akan memigrasikan tabel stasiun dan 95 sel heksagon H3 saat pertama kali dijalankan atau melalui pemanggilan API:
   ```bash
   curl -X POST https://your-backend.url/api/db/seed?force=true
   ```

---

## 4. Deployment Frontend: Vercel (100% Free)

Vercel adalah platform hosting terbaik untuk Next.js dengan dukungan CDN edge global otomatis.

### Langkah Setup:
1. Buka [Vercel Dashboard](https://vercel.com/) dan klik **Add New Project**.
2. Hubungkan repository GitHub Anda (`webgis-TransitERA`).
3. Pada halaman konfigurasi project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Klik *Edit* dan pilih folder: `webdev/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Tambahkan **Environment Variables**:
   | Variable | Value | Keterangan |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.url/api` | URL API backend FastAPI Anda |
5. Klik **Deploy**. Dalam waktu ~1 menit, aplikasi frontend WebGIS Anda sudah live dengan URL otomatis HTTPS (misal: `https://transitera-webgis.vercel.app`).

---

## 5. Deployment Backend: FastAPI Engine

Pilihlah salah satu dari opsi gratis terbaik berikut:

### Opsi A: Hugging Face Spaces (Sangat Direkomendasikan - CPU 16GB RAM Gratis Permanen)
1. Buka [Hugging Face Spaces](https://huggingface.co/spaces) dan buat Space baru.
2. Pilih Space SDK: **Docker** (Blank).
3. Buat file `Dockerfile` pada Space yang merujuk ke isi `webdev/backend/Dockerfile`.
4. Tambahkan **Repository Secrets**:
   - `DATABASE_URL`: URI koneksi Supabase Anda
   - `GEMINI_API_KEY`: Kunci API Google AI Studio Anda
   - `GEMINI_MODEL`: `gemini-1.5-flash` atau `gemini-2.0-flash`
   - `MAPID_API_KEY`: API Key GEO MAPID Anda
5. Space akan membangun container dan menyediakan URL publik HTTPS yang aktif 24/7 tanpa batas *sleep/cold start*.

### Opsi B: Azure Container Apps (Menggunakan Kredit $100 Mahasiswa ITS)
1. Di Azure Portal, cari layanan **Container Apps**.
2. Buat Container App baru di region `Southeast Asia`.
3. Pilih sumber deployment: **GitHub Actions** atau **Docker Hub/ACR**.
4. Set alokasi resource minimum: **0.25 vCPU, 0.5 GiB RAM** (masuk kuota gratis bulanan Azure).
5. Masukkan environment variables yang dibutuhkan (`DATABASE_URL`, `GEMINI_API_KEY`).

### Opsi C: Render / Railway Free Tier
- Jika menggunakan Render: Pilih **Web Service**, arahkan ke repo, tentukan root directory `webdev/backend`, dan pilih environment **Python 3**.

---

## 6. Strategi Isolasi Branch Deployment (`main` vs `deploy`)

Untuk menjaga agar dokumen rahasia tim, proposal, notulensi meeting, dan draft ide yang berada di folder `context/` tidak ikut ter-bundle ke publik pada cloud deployment:

### Cara Menggunakan Skrip Otomasi:
Jalankan skrip berikut di terminal root proyek:
```bash
python scripts/sync_deploy_branch.py
```

### Apa yang Dilakukan Skrip Ini?
1. Mengisolasi branch kerja `main` sebagai branch riset & development tim.
2. Membuat atau memperbarui branch `deploy` yang **hanya memuat file esensial aplikasi**:
   - `webdev/frontend/`
   - `webdev/backend/`
   - `docker-compose.yml`
   - `README.md`
   - `docs/DEPLOYMENT_GUIDE.md`
3. Membersihkan folder `context/`, dokumen riset PRD, dan skrip scraping sementara dari index Git branch `deploy`.
4. Anda tinggal menghubungkan branch `deploy` ini ke Vercel atau hosting cloud.

---

## 7. Checklist Variabel Lingkungan (*Environment Variables*)

Sebelum mempublikasikan ke publik, pastikan variabel berikut telah diset pada dashboard hosting masing-masing:

### Backend Environment Variables:
```ini
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
MAPID_API_KEY=your_mapid_key
```

### Frontend Environment Variables:
```ini
NEXT_PUBLIC_BACKEND_URL=https://api.transitera.me/api
```

---

## 8. Verifikasi Pasca-Deployment

Setelah deployment selesai, lakukan pengujian cepat berikut:
1. **Health Check Backend**: Kunjungi `https://your-backend.url/health`. Pastikan output menampilkan:
   ```json
   {
     "status": "healthy",
     "version": "1.0.0",
     "service": "TransitERA API",
     "database": {
       "status": "connected",
       "storage_mode": "postgis_live"
     }
   }
   ```
2. **Koneksi Frontend & Peta**: Buka URL Vercel Anda, buka tab `/map`, dan periksa apakah 5 stasiun transit, layer heksagon H3, dan layer Halte Bus dapat ditampilkan dengan lancar.
3. **Uji Asisten AI Gemini**: Buka panel chatbot AI spasial di pojok kanan bawah, ajukan pertanyaan seperti: *"Bagaimana kesiapan TOD di Stasiun Wonokromo?"*, dan pastikan peta merespons dengan melakukan zoom dan rendering radar chart 5D.
