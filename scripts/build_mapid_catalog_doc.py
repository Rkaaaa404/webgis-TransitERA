import requests
import string
import os
import time
from collections import defaultdict

BASE_URL = "https://server.mapid.io/moneys_bun/get_data_premium_by_category_id"

def collect_catalog():
    all_datasets = {}
    
    # Query targets: specific names and letter combinations
    queries = [
        "surabaya", "jawa timur",
        "demografi surabaya", "ses surabaya", "sosial ekonomi surabaya",
        "nighttime light surabaya", "spending jawa timur", "banjir surabaya",
        "stasiun surabaya", "pusat perbelanjaan surabaya", "apartemen surabaya",
        "hotel surabaya", "restoran surabaya", "kafe surabaya", "cafe surabaya",
        "sekolah surabaya", "pendidikan surabaya", "kesehatan surabaya", "apotek surabaya",
        "bank surabaya", "atm surabaya", "retail surabaya", "pasar surabaya",
        "toko surabaya", "transportasi surabaya", "jalan surabaya", "bengkel surabaya"
    ]
    
    # Add alphabet search to uncover items
    for char in string.ascii_lowercase:
        queries.append(f"di kota surabaya {char}")
        queries.append(f"surabaya {char}")
        
    print(f"Collecting across {len(queries)} search queries...")
    for q in queries:
        param = q.replace(" ", "+")
        try:
            r = requests.get(f"{BASE_URL}?search_params={param}", timeout=10)
            if r.status_code == 200:
                items = r.json()
                for it in items:
                    _id = it.get("_id")
                    if _id and _id not in all_datasets:
                        all_datasets[_id] = it
        except Exception:
            pass
        time.sleep(0.1)

    print(f"Total unique datasets found: {len(all_datasets)}")
    return all_datasets

def categorize(name):
    n = name.upper()
    if any(k in n for k in ["DEMOGRAFI", "PENDUDUK", "KESEJAHTERAAN", "STATUS EKONOMI", "SES"]):
        return "1. Demografi & Sosial Ekonomi (Input TOD D1/D2)"
    elif any(k in n for k in ["NIGHTTIME", "NTL", "CAHAYA"]):
        return "2. Nighttime Light / NTL (Input TOD D1 - Aktivitas Nokturnal)"
    elif any(k in n for k in ["SPENDING", "PENGELUARAN"]):
        return "3. People Spending & Daya Beli (Input TOD D2)"
    elif any(k in n for k in ["BANJIR", "BENCANA", "TSUNAMI", "LONGSOR", "EMISI", "SUHU", "TEMPERATURE"]):
        return "4. Kebencanaan, Iklim & Lingkungan (Variabel Kontrol/Disamenity)"
    elif any(k in n for k in ["STASIUN", "REL KERETA", "JALAN", "TRANSPORTASI", "AGEN PERJALANAN", "TERMINAL"]):
        return "5. Transportasi & Aksesibilitas (Input TOD D5)"
    elif any(k in n for k in ["PUSAT PERBELANJAAN", "MALL", "SUPERMARKET", "PASAR"]):
        return "6. Pusat Perbelanjaan & Magnet Perjalanan (Input TOD D4)"
    elif any(k in n for k in ["ALFAMART", "ALFA EXPRESS", "MINIMARKET", "RETAIL", "TOKO", "DEALER", "FURNITURE"]):
        return "7. Fasilitas Retail, UMKM & Komersial"
    elif any(k in n for k in ["APARTEMEN", "PERUMAHAN", "PROPERTI", "HOTEL", "PENGINAPAN"]):
        return "8. Properti, Hunian & Perhotelan"
    elif any(k in n for k in ["APOTEK", "RUMAH SAKIT", "KLINIK", "KESEHATAN"]):
        return "9. Fasilitas Kesehatan & Medis"
    elif any(k in n for k in ["SEKOLAH", "PENDIDIKAN", "KAMPUS", "UNIVERSITAS"]):
        return "10. Fasilitas Pendidikan & Riset"
    elif any(k in n for k in ["RESTORAN", "KAFE", "KULINER", "MAKANAN", "WARUNG", "F&B", "KOPI"]):
        return "11. F&B, Kafe & Kuliner"
    elif any(k in n for k in ["ATM", "BANK", "ASURANSI", "KEUANGAN"]):
        return "12. Perbankan & Layanan Finansial"
    elif any(k in n for k in ["BATAS ADMINISTRASI"]):
        return "13. Batas Wilayah Administrasi"
    else:
        return "14. Fasilitas Publik & Jasa Lainnya"

def generate_doc(datasets):
    surabaya_items = []
    jatim_items = []
    
    for it in datasets.values():
        name = it.get("name", "").upper()
        if "SURABAYA" in name:
            surabaya_items.append(it)
        elif "JAWA TIMUR" in name:
            jatim_items.append(it)
            
    # Sort
    surabaya_items.sort(key=lambda x: x.get("name", ""))
    jatim_items.sort(key=lambda x: x.get("name", ""))
    
    lines = []
    lines.append("# 🗺️ Katalog Resmi Dataset GEO MAPID: Kota Surabaya & Jawa Timur")
    lines.append("")
    lines.append("> **TransitERA Knowledge Document — MAPID WebGIS Competition 2026**  ")
    lines.append(f"> **Sumber Data:** Endpoint internal `https://server.mapid.io/moneys_bun/`  ")
    lines.append(f"> **Tanggal Ekstraksi:** {time.strftime('%Y-%m-%d %H:%M:%S')}  ")
    lines.append(f"> **Ringkasan:** Terkumpul **{len(surabaya_items)} Dataset Kota Surabaya** dan **{len(jatim_items)} Dataset Provinsi Jawa Timur**.")
    lines.append("")
    lines.append("Dokumen ini dibuat agar seluruh anggota tim dapat melihat peta kekayaan data spasial yang tersedia langsung di server MAPID, memetakan variabel untuk analisis spasial 5D TOD, melatih model AI/ML (PCA & Klasifikasi), serta menghubungkannya ke WebGIS.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 🌟 1. Dataset Inti untuk Analisis TOD & Model Machine Learning TransitERA")
    lines.append("")
    lines.append("Dataset berikut adalah variabel kunci yang digunakan langsung dalam sistem TransitERA:")
    lines.append("")
    lines.append("| Variabel TOD | Nama Dataset Resmi di MAPID | ID Layer (`_id`) | Geometri | Indikator PRD |")
    lines.append("| :--- | :--- | :--- | :---: | :--- |")
    lines.append("| **D1: Density** | `DEMOGRAFI DI KOTA SURABAYA` | `68b50b5c278efb81183ffe33` | `MultiPolygon` | Kepadatan penduduk per kelurahan/sel H3 |")
    lines.append("| **D1: Activity** | `NIGHTTIME LIGHT KOTA SURABAYA TAHUN 2023` | `658cdd6316b4b2aa8f418b28` | `MultiPolygon` | Radiansi cahaya malam (intensitas ekonomi nokturnal) |")
    lines.append("| **D2: Diversity** | `STATUS EKONOMI DAN SOSIAL - SOCIOECONOMIC STATUS (SES) KOTA SURABAYA TAHUN 2024` | `670cdf0c016420edc882b4c1` | `MultiPolygon` | Stratifikasi ekonomi warga & daya beli |")
    lines.append("| **D2: Spending** | `PEOPLE SPENDING PROVINSI JAWA TIMUR 2023` | `663dcac0e8ed38ec362465a3` | `MultiPolygon` | Rata-rata pengeluaran konsumsi per kapita |")
    lines.append("| **Disamenity** | `WILAYAH RISIKO BANJIR DI KOTA SURABAYA` | `68a711e2f33d3b7c30c54535` | `MultiPolygon` | Hambatan fisik & genangan air jalur pedestrian |")
    lines.append("| **D4: Destination** | `PUSAT PERBELANJAAN DI KOTA SURABAYA TAHUN 2025` | `684bb897c5a355508946bf72` | `Point` | Magnet pergerakan & aktivitas komersial utama |")
    lines.append("| **D5: Transit** | `STASIUN DI KOTA SURABAYA TAHUN 2025` | `68a829506386ff356dc7f10d` | `Point` | Simpul stasiun kereta api penumpang SRRL |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"## 🏙️ 2. Daftar Lengkap Dataset Kota Surabaya ({len(surabaya_items)} Dataset)")
    lines.append("")
    
    cat_map = defaultdict(list)
    for it in surabaya_items:
        c = categorize(it.get("name", ""))
        cat_map[c].append(it)
        
    for cat_name in sorted(cat_map.keys()):
        items_in_cat = cat_map[cat_name]
        lines.append(f"### {cat_name} ({len(items_in_cat)} Dataset)")
        lines.append("")
        lines.append("| No | Nama Dataset | ID Layer (`_id`) | Tipe | Proyek Induk |")
        lines.append("| :-: | :--- | :--- | :-: | :--- |")
        for idx, it in enumerate(items_in_cat, 1):
            name = it.get("name", "")
            _id = it.get("_id", "")
            geom = it.get("type", "Point")
            proj = it.get("geo_project", {}).get("name", "-")
            lines.append(f"| {idx} | {name} | `{_id}` | `{geom}` | {proj} |")
        lines.append("")
        
    lines.append("---")
    lines.append("")
    lines.append(f"## 🌾 3. Daftar Lengkap Dataset Provinsi Jawa Timur ({len(jatim_items)} Dataset)")
    lines.append("")
    lines.append("Dataset makro untuk analisis koridor aglomerasi Gerbangkertosusila (Surabaya - Sidoarjo - Gresik):")
    lines.append("")
    lines.append("| No | Nama Dataset | ID Layer (`_id`) | Tipe | Proyek Induk |")
    lines.append("| :-: | :--- | :--- | :-: | :--- |")
    for idx, it in enumerate(jatim_items, 1):
        name = it.get("name", "")
        _id = it.get("_id", "")
        geom = it.get("type", "Point")
        proj = it.get("geo_project", {}).get("name", "-")
        lines.append(f"| {idx} | {name} | `{_id}` | `{geom}` | {proj} |")
    lines.append("")
    
    lines.append("---")
    lines.append("")
    lines.append("## 🛠️ 4. Panduan Penggunaan & Konsumsi Data untuk Anggota Tim")
    lines.append("")
    lines.append("### A. Mengakses Metadata via Endpoint Internal MAPID:")
    lines.append("Semua dataset di atas dapat dicek skema atributnya (kolom-kolom datanya) menggunakan API:")
    lines.append("```bash")
    lines.append("# Format Request")
    lines.append("curl \"https://server.mapid.io/moneys_bun/get_data_premium_by_category_id?search_params={NAMA_DATASET}\"")
    lines.append("```")
    lines.append("")
    lines.append("Contoh response JSON mencakup array `fields` yang merinci:")
    lines.append("- Koordinat (`LONGITUDE`, `LATITUDE`)")
    lines.append("- Wilayah administrasi (`KECAMATAN`, `DESA`, `KABKOT`)")
    lines.append("- Nilai kuantitatif (indeks demografi, radiansi cahaya malam, nilai pengeluaran, dll.)")
    lines.append("")
    lines.append("### B. Cara Mengunduh File Spasial Penuh (GeoJSON / SHP):")
    lines.append("1. **Melalui Dashboard GEO MAPID**: Login ke [geo.mapid.io](https://geo.mapid.io), cari ID Layer di atas melalui Data Catalog / Project Editor, lalu tambahkan ke Project dan klik **Export Data**.")
    lines.append("2. **Melalui Script Backend TransitERA**: Jika Anda memiliki cookie sesi login MAPID, kita bisa memasukkan cookie tersebut ke file `.env` (`MAPID_COOKIE=...`) agar script otomatis mengunduh dan menyinkronkan seluruh poligon/titik ke database PostGIS lokal kita.")
    lines.append("")

    out_file = os.path.join(os.path.dirname(__file__), "..", "context", "catalog_and_sample", "MAPID_Surabaya_EastJava_Catalog.md")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Document successfully written to: {out_file}")

if __name__ == "__main__":
    datasets = collect_catalog()
    generate_doc(datasets)
