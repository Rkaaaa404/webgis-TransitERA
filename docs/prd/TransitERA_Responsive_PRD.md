# PRD — Responsive Design
## Website TransitERA (Landing Page & WebGIS Platform)

> Turunan dari `TransitERA_PRD.md` dan `../design/DESIGN.md`, fokus khusus pada **keterbacaan dan fungsionalitas di seluruh ukuran perangkat** — dari smartphone kecil sampai monitor desktop lebar. Disusun berdasarkan struktur implementasi aktual landing page sehingga bisa langsung dieksekusi sebagai instruksi perbaikan oleh coding agent.

| Field | Detail |
|---|---|
| Nama Produk | TransitERA — Responsive Web Requirements |
| Jenis Dokumen | PRD Pelengkap (Responsive/Multi-Device) |
| Versi | 1.0 |
| Tanggal | 30 Agustus 2026 |
| Konteks | MAPID WebGIS Competition 2026 |
| Status | Draft — siap diimplementasikan |

---

## Daftar Isi

1. [Latar Belakang & Masalah](#1-latar-belakang--masalah)
2. [Tujuan](#2-tujuan)
3. [Matriks Device & Breakpoint](#3-matriks-device--breakpoint)
4. [Temuan Kritis pada Implementasi Saat Ini](#4-temuan-kritis-pada-implementasi-saat-ini)
5. [Requirement per Section — Navigation](#5-requirement-per-section--navigation)
6. [Requirement per Section — Hero](#6-requirement-per-section--hero)
7. [Requirement per Section — Data-Driven Insights](#7-requirement-per-section--data-driven-insights)
8. [Requirement per Section — Segmented Solutions (3 Kartu Stakeholder)](#8-requirement-per-section--segmented-solutions-3-kartu-stakeholder)
9. [Requirement per Section — Platform Interface Showcase](#9-requirement-per-section--platform-interface-showcase)
10. [Requirement per Section — Footer](#10-requirement-per-section--footer)
11. [Requirement Lintas-Section (Cross-Cutting)](#11-requirement-lintas-section-cross-cutting)
12. [Responsivitas Modul WebGIS (Peta, Dashboard, AI Chat)](#12-responsivitas-modul-webgis-peta-dashboard-ai-chat)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Matriks Pengujian](#14-matriks-pengujian)
15. [Definition of Done](#15-definition-of-done)

---

## 1. Latar Belakang & Masalah

TransitERA ditujukan untuk tiga persona dengan konteks pemakaian berbeda: Perencana Kota (kemungkinan besar desktop di kantor Dishub), Investor/Analis Properti (campuran desktop & tablet saat survei lapangan), dan Pelaku UMKM (**mayoritas mobile** — sesuai catatan PRD utama: *"Pengujian antarmuka mobile via smartphone"* untuk persona UMKM). Website yang tidak responsif akan langsung menggagalkan value proposition untuk 1 dari 3 persona inti.

Review terhadap implementasi saat ini (`code.html`) menemukan bahwa strategi responsif baru diterapkan sebagian — beberapa section sudah menggunakan breakpoint Tailwind (`md:`, `lg:`) dengan baik, namun ada **gap fungsional pada mobile** yang perlu diperbaiki sebelum submission (lihat Bagian 4).

## 2. Tujuan

- Memastikan seluruh halaman (landing page & platform WebGIS) **fungsional penuh**, bukan cuma "tidak pecah", di setiap kelas perangkat.
- Menutup gap navigasi mobile yang saat ini membuat sebagian menu tidak dapat diakses di layar kecil.
- Menstandarkan breakpoint di seluruh dokumen (PRD utama, DESIGN.md, dan implementasi kode) agar tidak ada penafsiran ganda.
- Menjamin peta interaktif (MapLibre GL JS + H3 choropleth) dan AI Chat Panel — komponen paling kompleks — tetap dapat dioperasikan dengan nyaman di layar sekecil 360px.
- Menjadikan performa mobile (First Contentful Paint < 1,8 detik, Lighthouse ≥ 85 — target dari PRD utama) sebagai bagian dari definisi "responsif", bukan cuma tata letak.

## 3. Matriks Device & Breakpoint

DESIGN.md mendefinisikan 3 breakpoint utama (Mobile <768px, Tablet 768–1024px, Desktop >1024px). Untuk QA yang presisi, breakpoint tersebut dipecah lebih granular sebagai berikut — **tanpa mengubah breakpoint Tailwind yang sudah ada**, ini murni matriks pengujian:

| Kelas Device | Lebar Viewport | Contoh Perangkat Nyata | Breakpoint Tailwind Terkait |
|---|---|---|---|
| Small Mobile | 320–374px | iPhone SE, Android entry-level lama | base (tanpa prefix) |
| Standard Mobile | 375–767px | iPhone 12–16, kebanyakan Android mid-range | base, `sm:` (≥640px) |
| Tablet | 768–1023px | iPad, iPad Mini, tablet Android | `md:` (≥768px) |
| Desktop | 1024–1439px | Laptop umum (1366×768, 1440×900) | `lg:` (≥1024px) |
| Large Desktop | ≥1440px | Monitor eksternal, iMac, layar presentasi juri | `xl:` (≥1280px), `2xl:` (≥1536px) |

**Catatan khusus:** Karena presentasi/demo ke juri kemungkinan memakai proyektor atau layar besar, kelas **Large Desktop** wajib diuji eksplisit — konten tidak boleh terlihat "kosong"/terlalu melebar pada layar ≥1440px (perhatikan `max-w-7xl` yang sudah diterapkan konsisten di kode saat ini — pertahankan pola ini).

## 4. Temuan Kritis pada Implementasi Saat Ini

Review langsung terhadap `code.html` menemukan isu berikut — didaftar sebagai prioritas perbaikan tertinggi:

| # | Temuan | Lokasi di Kode | Dampak | Prioritas |
|---|---|---|---|---|
| C1 | **Tidak ada tombol hamburger/menu mobile.** Link navigasi (`Platform`, `Solutions`, `Use Cases`, `About`) memakai class `hidden md:flex` — di bawah 768px, link ini hilang total tanpa ada pengganti apa pun untuk mengaksesnya. | `<nav>`, baris ~83 | Pengguna mobile (termasuk persona UMKM, target utama mobile) **tidak bisa mengakses navigasi utama sama sekali** | **Kritis — Must Fix** |
| C2 | Link "Log in" memakai `hidden md:block` — di mobile, akses login juga ikut hilang (hanya tombol "Get Started" yang tersisa). | `<nav>`, baris ~90 | Konsisten dengan C1 — perlu masuk ke menu mobile | **Kritis — Must Fix** |
| C3 | Grid 3 kartu stakeholder (`grid-cols-1 md:grid-cols-3`) melompat langsung dari 1 kolom ke 3 kolom tepat di 768px — pada Tablet (768–1023px), tiga kartu setinggi 400px berdampingan akan sangat sempit (~240px/kartu). | Segmented Solutions, baris ~175 | Kartu tampak sesak, gambar background & teks judul berpotensi terlalu padat di tablet | **Should Fix** |
| C4 | Tinggi kartu stakeholder di-hardcode `h-[400px]` tanpa penyesuaian per breakpoint — pada mobile sempit (320–374px) dengan lebar kartu penuh, rasio tinggi:lebar jadi sangat "kurus memanjang" secara tidak proporsional. | Segmented Solutions, baris ~177/187/197 | Estetika kurang optimal di small mobile | **Should Fix** |
| C5 | Semua gambar memuat resolusi tunggal (URL tetap, tanpa `srcset`/`sizes`) — perangkat mobile mengunduh ukuran gambar yang sama dengan desktop meski ditampilkan lebih kecil. | Seluruh `<img>` di file | Boros bandwidth di mobile, memperlambat FCP di koneksi 4G lambat | **Should Fix** |
| C6 | Footer grid (`grid-cols-2 md:grid-cols-4`) menampilkan kolom "Products" dan "Company" berdampingan sempit pada layar 320–360px. | Footer, baris ~243 | Teks link footer berpotensi wrap/terlalu rapat di small mobile | **Could Fix** |
| C7 | Plugin `container-queries` sudah di-load (`?plugins=forms,container-queries`) tapi belum dipakai sama sekali di kode — peluang belum dimanfaatkan untuk komponen yang idealnya responsif terhadap *container*-nya (mis. kartu stakeholder di dalam panel AI yang lebih sempit dari viewport). | `<script>` tag CDN | Bukan bug, tapi *missed opportunity* untuk pola WebGIS yang punya banyak panel bersarang | **Could Improve** |

---

## 5. Requirement per Section — Navigation

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-01 | Tambahkan tombol hamburger menu yang **tampil hanya di bawah breakpoint `md` (< 768px)**, menggantikan posisi link navigasi yang disembunyikan (memperbaiki temuan C1). | Must |
| RWD-02 | Tombol hamburger membuka panel/drawer navigasi (full-screen overlay atau dropdown dari nav bar) berisi seluruh link yang saat ini hanya ada di desktop: Platform, Solutions, Use Cases, About, **dan** Log in (memperbaiki temuan C2). | Must |
| RWD-03 | Panel navigasi mobile menggunakan efek glassmorphic yang sama (`glass-panel`) agar konsisten dengan desain sistem, dengan tombol close (×) yang jelas. | Should |
| RWD-04 | Target sentuh (tap target) setiap item menu mobile minimal **44×44px** (standar WCAG 2.1) — termasuk hamburger icon itu sendiri. | Must |
| RWD-05 | Nav bar tetap `fixed top-0` dan sticky di seluruh breakpoint, tapi tinggi nav (`h-20`) dapat dipersempit sedikit di mobile (mis. `h-16`) agar tidak memakan porsi layar kecil terlalu banyak. | Should |
| RWD-06 | Logo & wordmark "TransitERA" tetap terlihat penuh (tidak terpotong) di lebar viewport 320px — uji dengan logo + "TransitERA" + tombol Get Started dalam satu baris nav pada 320px. | Must |
| RWD-07 | Saat menu mobile terbuka, scroll pada body halaman utama dikunci (`overflow: hidden` pada `<body>`) agar tidak terjadi scroll ganda yang membingungkan. | Should |

## 6. Requirement per Section — Hero

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-08 | Headline (`text-5xl md:text-7xl`) diverifikasi tidak terpotong/wrap secara aneh pada Small Mobile (320px) — uji kata "Transportation" tidak overflow horizontal. Tambahkan step breakpoint tambahan bila perlu (mis. `text-4xl sm:text-5xl md:text-7xl`). | Must |
| RWD-09 | Padding vertikal hero (`pt-32 pb-20 lg:pt-48 lg:pb-32`) dan `min-h-[90vh]` dipastikan tidak membuat CTA button terlalu jauh di bawah *fold* pada mobile dengan address bar browser yang memakan viewport (gunakan `min-h-[90svh]` — small viewport height — agar tidak terpengaruh browser chrome mobile yang naik-turun). | Should |
| RWD-10 | Dua CTA (`Explore the Platform`, `Book a Demo`) dengan `flex-col sm:flex-row` sudah tepat (stack di mobile, sejajar di ≥640px) — pertahankan pola ini, pastikan lebar tombol pada mode stacked mengikuti lebar kontainer dengan margin yang nyaman (bukan lebar penuh 100% tanpa padding). | Must |
| RWD-11 | Badge "Maps That Think!" dan paragraf subheadline diuji agar `max-w-2xl mx-auto` tetap terbaca nyaman (tidak terlalu lebar) pada Tablet & Large Desktop. | Should |
| RWD-12 | Background image hero (`object-cover`) diuji pada aspect ratio ekstrem (mobile sangat memanjang vertikal, mis. 390×844) — pastikan area fokus visual (kota/H3 grid) tidak "kepotong" jadi tidak bermakna. | Could |

## 7. Requirement per Section — Data-Driven Insights

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-13 | Layout `flex-col lg:flex-row` sudah tepat (stack penuh di bawah 1024px). Pastikan urutan visual saat stacked: teks/fitur dulu baru gambar dashboard (urutan DOM saat ini sudah benar — teks di atas, gambar di bawah — pertahankan). | Must |
| RWD-14 | Dua kartu fitur (`Retail Success Score`, `Predictive Insights`) di dalam `glass-panel` dipastikan padding (`p-6`) tidak membuat teks terlalu mepet di Small Mobile — uji lebar kartu minimum 320px - margin. | Should |
| RWD-15 | Gambar dashboard mockup (`w-full h-auto`) pada mode stacked mobile tidak boleh melebihi tinggi viewport secara berlebihan — pertimbangkan `max-h-[70vh] object-contain` khusus mobile bila gambar dashboard punya rasio sangat lebar. | Could |

## 8. Requirement per Section — Segmented Solutions (3 Kartu Stakeholder)

Menindaklanjuti temuan C3 & C4.

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-16 | Ubah grid dari `grid-cols-1 md:grid-cols-3` menjadi **3 tahap**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — sehingga Tablet (768–1023px) menampilkan 2 kolom (kartu ketiga turun ke baris kedua), bukan 3 kolom sempit. | Must |
| RWD-17 | Tinggi kartu (`h-[400px]`) diubah menjadi responsif: mis. `h-[280px] sm:h-[340px] lg:h-[400px]` agar rasio tetap proporsional di Small Mobile. | Should |
| RWD-18 | Teks deskripsi kartu (`text-sm`) dan judul (`text-2xl`) diuji tetap terbaca jelas di atas foreground image dengan overlay gradient — khususnya pada mode 2-kolom tablet di mana lebar kartu lebih sempit dari desktop. | Should |
| RWD-19 | Efek hover (`group-hover:opacity-60`) yang bergantung pada mouse hover **tidak berfungsi di touch device** — pastikan ada state default yang cukup jelas terbaca di mobile/tablet tanpa perlu hover (opacity default jangan terlalu rendah di touch device), atau tambahkan interaksi tap sebagai alternatif. | Should |
| RWD-20 | Padding konten kartu (`p-8`) di-review agar tidak terlalu besar relatif terhadap kartu yang lebih pendek di mobile (`RWD-17`) — sarankan `p-6 lg:p-8`. | Could |

## 9. Requirement per Section — Platform Interface Showcase

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-21 | Dua layer dashboard dekoratif (kiri `hidden md:block`, kanan `hidden lg:block`) sudah tepat disembunyikan di layar kecil untuk menghindari elemen absolute-positioned yang overflow — **pertahankan pola ini**, jangan dimunculkan di mobile karena berisiko elemen bertumpuk tidak rapi pada layar sempit. | Must |
| RWD-22 | Dashboard utama (`max-w-5xl mx-auto`, `w-full h-auto`) diuji agar browser-chrome mockup (dots merah/kuning/hijau + URL bar) tetap proporsional dan teks URL (`text-xs font-mono`) tidak terlalu kecil dibaca di mobile. | Should |
| RWD-23 | Karena gambar dashboard adalah screenshot UI kompleks (radar chart, angka, peta kecil di dalamnya), pastikan gambar tidak di-scale terlalu kecil di Small Mobile sehingga teks di dalam screenshot jadi tidak terbaca sama sekali — pertimbangkan menyediakan versi crop/zoom khusus mobile jika diperlukan, atau minimal pastikan `object-fit` tidak memotong bagian penting. | Could |

## 10. Requirement per Section — Footer

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-24 | Pertimbangkan `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` (menambah 1 tahap di bawah `sm`) untuk Small Mobile (<375px) agar kolom Products/Company tidak berdampingan terlalu sempit (menindaklanjuti C6). | Could |
| RWD-25 | Baris copyright + ikon sosial (`flex-col md:flex-row`) sudah tepat stack di mobile — pertahankan, pastikan jarak (`gap-4`) cukup agar ikon Twitter/LinkedIn tidak menempel terlalu dekat dengan teks copyright di layar sempit. | Should |

## 11. Requirement Lintas-Section (Cross-Cutting)

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-26 | Terapkan `<meta name="viewport" content="width=device-width, initial-scale=1.0">` di seluruh halaman platform (sudah ada di landing page saat ini — pastikan konsisten di semua halaman WebGIS/dashboard yang akan dibangun menyusul). | Must |
| RWD-27 | Semua gambar dekoratif/konten menggunakan `srcset`/`sizes` atau setara (mis. Next.js `<Image>` component dengan `sizes` prop) agar device mobile tidak mengunduh aset resolusi desktop penuh (menindaklanjuti temuan C5). | Should |
| RWD-28 | Tidak ada horizontal scroll (overflow-x) yang tidak disengaja di breakpoint mana pun — `overflow-x-hidden` pada `<body>` sudah diterapkan sebagai *safety net*, tapi tetap wajib diverifikasi tiap section tidak mendorong lebar melebihi viewport (terutama elemen `absolute -left-12 lg:-left-32` di Platform Showcase — pastikan tetap di-clip dengan benar oleh parent `overflow-hidden`). | Must |
| RWD-29 | Seluruh tombol interaktif (CTA, ikon sosial, link) memiliki target sentuh minimal 44×44px di breakpoint mobile & tablet, sesuai WCAG 2.1 Level AA (2.5.5 Target Size). | Should |
| RWD-30 | Tipografi menggunakan unit relatif (`rem`, sesuai `spacing.unit: 8px` dan skala di `DESIGN.md`) — hindari nilai `px` fixed untuk font-size baru yang ditambahkan, agar tetap menghormati pengaturan zoom/font browser pengguna. | Should |
| RWD-31 | Uji mode orientasi **landscape pada mobile** (mis. 667×375 saat HP diputar) — khususnya section Hero dengan `min-h-[90vh]` yang berisiko membuat CTA tidak terlihat tanpa scroll saat viewport height mengecil drastis di landscape. | Should |
| RWD-32 | Efek `backdrop-filter: blur(12px)` pada `.glass-panel` diuji performanya di perangkat mobile low-end (throttle CPU 4x di Chrome DevTools) — bila terjadi jank/frame drop signifikan saat scroll, sediakan fallback solid background via `@supports not (backdrop-filter: blur(1px))`. | Should |

## 12. Responsivitas Modul WebGIS (Peta, Dashboard, AI Chat)

Landing page baru mencakup sebagian kecil produk. Modul inti (peta interaktif, dashboard scorecard, AI Chat Panel) yang dijelaskan di PRD utama Bagian 10 (User Flow/Wireframe) punya kebutuhan responsif tersendiri yang lebih kompleks:

| ID | Requirement | Prioritas |
|---|---|---|
| RWD-33 | **Desktop (≥1024px)**: Layout 3-panel — sidebar kiri (layer control/filter), peta di tengah, panel kanan (AI & Dashboard) *collapsible* — sesuai deskripsi wireframe PRD utama. Panel kanan dapat di-collapse manual oleh pengguna untuk memaksimalkan area peta. | Must |
| RWD-34 | **Tablet (768–1023px)**: Sidebar kiri (filter/layer) dikondensasi menjadi ikon-ikon (sesuai `DESIGN.md`: *"Side panels condensed to icons"*) yang expand jadi panel saat di-tap, bukan hilang total. | Must |
| RWD-35 | **Mobile (<768px)**: Peta menjadi *full-screen base layer*; filter, AI Chat, dan Dashboard diakses via **Bottom Sheet draggable** (sesuai `DESIGN.md` Components) yang bisa di-swipe naik untuk full-screen analitik atau turun untuk memaksimalkan tampilan peta. | Must |
| RWD-36 | **Mobile**: Navigasi antar-fitur (Peta, Filter, AI, Dashboard) menggunakan **bottom navigation bar** dengan tab tetap terlihat — bukan disembunyikan di dalam hamburger menu (fitur inti butuh akses 1-tap, beda perlakuan dari nav marketing di landing page). | Must |
| RWD-37 | AI Chat Panel pada mobile (dalam Bottom Sheet) memastikan **keyboard virtual tidak menutupi area input chat** — input field harus tetap terlihat & ter-scroll ke atas keyboard saat fokus (gunakan `visualViewport` API atau padding dinamis). | Must |
| RWD-38 | Radar chart 5D dan scorecard numerik (Chart.js/Recharts) di-render ulang (responsive resize, bukan di-scale via CSS transform) saat viewport berubah — chart library dikonfigurasi `responsive: true, maintainAspectRatio: false` dengan container yang punya tinggi eksplisit di mobile. | Must |
| RWD-39 | Popup atribut H3 cell (saat klik sel di peta) pada mobile ditampilkan sebagai **bottom sheet/modal** (bukan popup Leaflet/MapLibre kecil mengambang) agar teks skor TOD, %ΔNJOP, dan tipologi tetap terbaca nyaman di layar sempit — konsisten dengan pola Bottom Sheet yang sudah didefinisikan. | Should |
| RWD-40 | Kontrol zoom/pan peta (MapLibre GL JS) dipastikan mendukung **gesture touch native** (pinch-to-zoom, drag pan, double-tap zoom) tanpa konflik dengan scroll halaman di sekitarnya pada mobile. | Must |
| RWD-41 | Tombol export PDF/CSV pada mobile tetap dapat diakses dari dalam Bottom Sheet/menu, dengan ukuran tap target memadai (§RWD-29). | Should |
| RWD-42 | Search bar pencarian lokasi/simpul pada mobile menggunakan input full-width dengan `type="search"` dan `inputmode` yang sesuai, memicu keyboard mobile yang tepat (bukan keyboard numerik/email). | Could |

## 13. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performa | First Contentful Paint < 1,8 detik pada simulasi 4G (Slow 4G throttle di Lighthouse) — target dari PRD utama, berlaku khusus untuk viewport mobile. |
| Performa | Lighthouse Performance Score ≥ 85 diuji **secara terpisah** untuk mode Mobile dan Desktop di Chrome DevTools/PageSpeed Insights — skor mobile umumnya lebih rendah dari desktop, jadi kedua angka wajib dilaporkan. |
| Aksesibilitas | Rasio kontras teks-terhadap-background memenuhi WCAG AA (≥4.5:1 teks normal, ≥3:1 teks besar) di seluruh breakpoint — termasuk teks di atas gambar dengan overlay gradient pada kartu stakeholder. |
| Kompatibilitas Browser | Chrome, Safari (termasuk Safari iOS — perhatikan quirk `backdrop-filter` & `100vh` di iOS Safari), Firefox, Edge — 2 versi major terakhir, mobile & desktop. |
| Kompatibilitas Input | Mendukung input mouse, touch (single & multi-touch untuk peta), dan keyboard (tab navigation) tanpa kehilangan fungsionalitas apa pun di salah satu mode. |
| Orientasi | Seluruh halaman berfungsi baik di orientasi portrait **dan** landscape pada mobile & tablet — tidak ada asumsi "hanya portrait". |

## 14. Matriks Pengujian

Checklist minimal sebelum dianggap "responsif penuh", dijalankan di Chrome DevTools Device Toolbar (minimum) atau perangkat fisik (ideal):

| Perangkat/Preset | Viewport | Yang Diuji |
|---|---|---|
| iPhone SE | 375×667 | Navigasi mobile (RWD-01–07), Hero tidak overflow (RWD-08), Bottom Sheet peta (RWD-35) |
| iPhone 14/15 | 390×844 | Landscape mode (RWD-31), keyboard AI Chat (RWD-37) |
| Android mid-range (mis. Galaxy A-series) | 360×800 | Small Mobile edge case (320–374px band), performa `backdrop-filter` (RWD-32) |
| iPad Mini | 768×1024 | Kartu stakeholder 2-kolom (RWD-16), sidebar icon-condensed (RWD-34) |
| iPad Pro | 1024×1366 | Transisi Tablet→Desktop tepat di 1024px |
| Laptop umum | 1366×768 | Layout desktop standar, 3-panel WebGIS (RWD-33) |
| Large Desktop | 1920×1080 | `max-w-7xl` tidak membuat konten "tenggelam", proyektor presentasi juri |
| Manual resize | 320px → 2560px | Drag manual browser window perlahan dari kiri ke kanan, pastikan **tidak ada titik breakpoint yang "patah"** (elemen bertabrakan/overflow) di lebar mana pun, bukan cuma di titik breakpoint standar |

## 15. Definition of Done

Bagian ini dianggap selesai bila seluruh syarat berikut terpenuhi:

- [ ] Seluruh item **Must** pada Bagian 5–12 diimplementasikan dan lolos verifikasi manual.
- [ ] Temuan Kritis C1 & C2 (navigasi mobile hilang) sudah diperbaiki dan diverifikasi di viewport 320–767px.
- [ ] Tidak ditemukan horizontal scroll tak disengaja di seluruh Matriks Pengujian (Bagian 14).
- [ ] Lighthouse Mobile Performance Score ≥ 85 tercapai pada halaman landing page.
- [ ] AI Chat Panel dan peta interaktif telah diuji fungsional penuh (bukan cuma visual) di minimal satu perangkat mobile fisik/emulator dan satu tablet.
- [ ] Tidak ada elemen dengan target sentuh < 44×44px pada breakpoint mobile untuk aksi-aksi utama (CTA, nav, filter, export).
- [ ] Review final dilakukan pada resize manual browser (bukan hanya preset device) untuk menangkap breakpoint "patah" yang tidak tertangkap preset standar.

---

*Dokumen ini melengkapi `TransitERA_PRD.md`, `DESIGN.md`, dan `TransitERA_Security_PRD.md`. Prioritas Must → Should → Could mengikuti konvensi yang sama dengan dokumen-dokumen tersebut untuk memudahkan eksekusi bertahap oleh coding agent (Claude Code).*
