import os
import logging
import random
import requests

logger = logging.getLogger(__name__)

MAPID_API_KEY = os.getenv("MAPID_API_KEY", "")
# GEO MAPID Competition endpoint (POST, polygon + hashtag filter)
ENDPOINT = "https://server.mapid.io/web/competition/"


def fetch_survey_geojson(polygon_coords: list, hashtag: str = "PakSibukGa") -> dict:
    """
    Mengambil data survei kompetisi dari GEO MAPID REST API dengan pagination otomatis.
    Mengembalikan GeoJSON FeatureCollection dict langsung (tanpa geopandas).

    Trade-off dari refactor ini:
      + Jauh lebih ringan: tidak ada GDAL/geopandas dependency → Docker build ~5 menit lebih cepat
      + Tidak ada eval() security vulnerability
      - Kehilangan operasi spasial berbasis GeoDataFrame; jika di masa depan dibutuhkan
        (misal: spatial join ke H3 grid), perlu ditambahkan kembali atau gunakan shapely saja.
    """
    if not MAPID_API_KEY:
        logger.warning("MAPID_API_KEY tidak diset — menggunakan data dummy survey.")
        return {"type": "FeatureCollection", "features": _generate_dummy_survey_data()}

    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": MAPID_API_KEY,
    }

    all_features = []
    offset = 0

    while True:
        payload = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": polygon_coords,
            },
            "offset": offset,
            "hashtag": [hashtag],
        }

        try:
            logger.info(f"Fetching MAPID survey data (offset={offset}, hashtag={hashtag!r})…")
            resp = requests.post(ENDPOINT, json=payload, headers=headers, timeout=30)

            if resp.status_code == 401 or resp.status_code == 403:
                logger.error(
                    f"MAPID API auth error {resp.status_code} — periksa MAPID_API_KEY di .env. "
                    f"Menggunakan data dummy."
                )
                break
            elif resp.status_code == 404:
                logger.warning(
                    "MAPID API 404: Kemungkinan data survei belum diinput ke platform GEO MAPID, "
                    "atau hashtag '#PakSibukGa' belum terdaftar pada akun ini. "
                    "Menggunakan data dummy lokal."
                )
                break

            resp.raise_for_status()
            data = resp.json()
        except requests.exceptions.Timeout:
            logger.error("MAPID API timeout (>30s) — menggunakan data dummy.")
            break
        except requests.exceptions.RequestException as e:
            logger.error(f"MAPID API request gagal: {e}")
            break

        features = data.get("features", [])
        all_features.extend(features)

        if not features or not data.get("hasMore", False):
            break

        offset += len(features)

    if not all_features:
        logger.info("MAPID API tidak mengembalikan fitur — menggunakan data dummy survey.")
        all_features = _generate_dummy_survey_data()

    return {"type": "FeatureCollection", "features": all_features}


def _generate_dummy_survey_data() -> list:
    """
    Men-generate 360 titik data survei realistis sesuai Dokumen Rencana Survei Form A #PakSibukGa:
    - 100 Data Activity (Pedestrian, Multimodal, Hambatan, UX)
    - 100 Data Mission Properti Go (Sewa ruko, kavling tanah, perkantoran)
    - 80 Data Mission Struk Go (Bukti transaksi ritel, minimarket, kafe)
    - 80 Data Mission Menu Go (Harga makanan, kuliner UMKM lokal)
    Total = 360 titik spasial valid yang terdistribusi di 5 simpul stasiun Surabaya.
    """
    stations = {
        "gubeng":     {"name": "Stasiun Surabaya Gubeng", "coord": [-7.2654, 112.7521]},
        "pasar_turi": {"name": "Stasiun Pasar Turi", "coord": [-7.2478, 112.7306]},
        "semut":      {"name": "Stasiun Surabaya Kota (Semut)", "coord": [-7.2372, 112.7431]},
        "wonokromo":  {"name": "Stasiun Wonokromo", "coord": [-7.3014, 112.7383]},
        "waru":       {"name": "Stasiun Waru", "coord": [-7.3519, 112.7297]},
    }

    surveyors = [
        "@zulfanfakhriza",
        "@mirzawibisono",
        "@hanaamira",
        "@rayhanagnan",
        "@raykadharma",
    ]

    activity_catalogs = [
        ("Trotoar Lebar & Tactile Paving", "Kondisi trotoar baik dengan guiding block disabilitas menuju pintu stasiun.", "Pedestrian & Walkability"),
        ("Trotoar Rusak & Lubang Drainase", "Permukaan paving amblas sedalam 10 cm, berisiko bagi lansia saat malam.", "Pedestrian & Walkability"),
        ("Zebra Cross Pudar Tanpa Pelican Light", "Penyeberangan pejalan kaki di depan stasiun tidak memiliki tombol lampu sinyal.", "Pedestrian & Walkability"),
        ("Integrasi Halte Feeder WiraWiri", "Pemberhentian feeder bus berjarak 40 meter dari lobi selatan, headway ~10 menit.", "Transit Multimodal"),
        ("Pangkalan Ojek Online Terorganisir", "Area drop-off ojol tertata rapi di luar sirkulasi pejalan kaki utama stasiun.", "Transit Multimodal"),
        ("Halte Suroboyo Bus Koridor Utama", "Shelter bus bersih dengan papan informasi rute real-time dan pembayaran non-tunai.", "Transit Multimodal"),
        ("PKL Meluber ke Jalur Pejalan Kaki", "Tenda pedagang kaki lima memakan 60% lebar trotoar, pejalan kaki terpaksa turun ke aspal.", "Hambatan & Disamenity"),
        ("Titik Genangan Air Hujan / Banjir", "Saluran drainase tersumbat sampah plastik, genangan air setinggi 15 cm saat hujan deras.", "Hambatan & Disamenity"),
        ("Parkir Liar Sepeda Motor", "Deretan motor parkir di trotoar depan pertokoan memblokir akses kursi roda.", "Hambatan & Disamenity"),
        ("Kepadatan Antrean Jam Sibuk Pagi", "Antrean penumpang feeder mengular hingga keluar shelter antara pukul 06.45 - 07.45 WIB.", "User Experience"),
    ]

    properti_catalogs = [
        ("Ruko Komersial 2 Lantai Disewakan", "Cocok untuk kantor perbankan/ekspedisi, luas 120m2, dekat stasiun.", "Rp 55.000.000 / tahun"),
        ("Kios Usaha Kuliner & Retail", "Kios strategis pinggir jalan akses utama stasiun, daya listrik 2200W.", "Rp 24.000.000 / tahun"),
        ("Tanah Kavling Komersial Hook Dijual", "Sertifikat SHM, luas 350m2, potensi tinggi untuk hotel transit atau co-working.", "Rp 4.200.000.000"),
        ("Ruang Usaha Siap Pakai", "Bekas apotek, lantai keramik rapi, area parkir muat 3 mobil dan 10 motor.", "Rp 40.000.000 / tahun"),
        ("Rumah Tinggal Bisa Alih Fungsi Kantor", "Luas tanah 180m2, jalan row 8 meter, hanya 300m dari gate stasiun.", "Rp 35.000.000 / tahun"),
    ]

    struk_catalogs = [
        ("Indomaret Point Stasiun", "Pembelian air mineral, roti, dan kopi siap saji.", "Rp 28.500"),
        ("Alfamart Transit Hub", "Pembelian snack, minuman isotonik, dan isi ulang e-money.", "Rp 42.000"),
        ("Kopi Kenangan Mantan", "Pembelian 2 cup kopi susu dan roti toast pagi.", "Rp 46.000"),
        ("Warung Madura 24 Jam", "Pembelian rokok, pulsa, dan air mineral dingin.", "Rp 34.000"),
        ("Apotek Kimia Farma Transit", "Pembelian obat flu, vitamin C, dan minyak angin.", "Rp 58.000"),
    ]

    menu_catalogs = [
        ("Soto Madura Daging & Telur", "Soto daging sapi kuah gurih bumbu rempah khas Surabaya.", "Rp 25.000"),
        ("Lontong Balap Pak Gendut", "Lontong balap tauge segar, tahu goreng, lentho, dan sate kerang.", "Rp 20.000"),
        ("Rawon Daging Kalkulator", "Rawon kuah hitam pekat potongan daging empuk sambal terasi.", "Rp 35.000"),
        ("Tahu Campur Lamongan", "Tahu goreng, lentho singkong, perkedel, selada, dan petis udang.", "Rp 22.000"),
        ("Es DeGan Murni & Jeruk", "Minuman kelapa muda segar pelepas dahaga komuter siang hari.", "Rp 10.000"),
    ]

    rng = random.Random(42)  # Seeded deterministik
    features = []
    point_idx = 1

    for st_id, st_info in stations.items():
        base_lat, base_lon = st_info["coord"]
        st_name = st_info["name"]

        # 1. 20 Activity per station = 100 total
        for i in range(20):
            r = (rng.random() ** 0.5) * 0.0075  # Dalam radius ~800m
            theta = rng.random() * 2 * 3.14159265
            lat = base_lat + r * (2 ** 0.5) * 0.7 * (1 if rng.random() > 0.5 else -1)
            lon = base_lon + r * (2 ** 0.5) * 0.7 * (1 if rng.random() > 0.5 else -1)
            dist_m = int(r * 111000)

            title, desc, cat = activity_catalogs[i % len(activity_catalogs)]
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                "properties": {
                    "id": f"SURV-ACT-{point_idx:03d}",
                    "hashtag": ["PakSibukGa"],
                    "title": title,
                    "survey_type": "activity",
                    "mission_subtype": None,
                    "category": cat,
                    "station_cluster": st_id,
                    "station_name": st_name,
                    "description": desc,
                    "distance_m": dist_m,
                    "zone": "Core Pedestrian Zone (0-400m)" if dist_m <= 400 else "Primary Catchment (400-800m)",
                    "price_info": "N/A (Fasilitas Publik)",
                    "user": surveyors[i % len(surveyors)],
                    "timestamp": f"2026-09-02 {8 + (i % 10):02d}:{15 + (i * 2) % 45:02d} WIB"
                },
            })
            point_idx += 1

        # 2. 20 Properti Go per station = 100 total
        for i in range(20):
            r = (rng.random() ** 0.5) * 0.0085
            lat = base_lat + (rng.random() - 0.5) * 0.014
            lon = base_lon + (rng.random() - 0.5) * 0.014
            dist_m = int(abs(lat - base_lat) * 111000 + abs(lon - base_lon) * 111000)

            title, desc, price = properti_catalogs[i % len(properti_catalogs)]
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                "properties": {
                    "id": f"SURV-PROP-{point_idx:03d}",
                    "hashtag": ["PakSibukGa"],
                    "title": title,
                    "survey_type": "mission",
                    "mission_subtype": "properti_go",
                    "category": "Komersial & Properti",
                    "station_cluster": st_id,
                    "station_name": st_name,
                    "description": desc,
                    "distance_m": dist_m,
                    "zone": "Core Pedestrian Zone (0-400m)" if dist_m <= 400 else "Primary Catchment (400-800m)",
                    "price_info": price,
                    "user": surveyors[(i + 1) % len(surveyors)],
                    "timestamp": f"2026-09-02 {9 + (i % 9):02d}:{10 + (i * 3) % 45:02d} WIB"
                },
            })
            point_idx += 1

        # 3. 16 Struk Go per station = 80 total
        for i in range(16):
            lat = base_lat + (rng.random() - 0.5) * 0.009
            lon = base_lon + (rng.random() - 0.5) * 0.009
            dist_m = int(abs(lat - base_lat) * 111000 + abs(lon - base_lon) * 111000)

            title, desc, price = struk_catalogs[i % len(struk_catalogs)]
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                "properties": {
                    "id": f"SURV-STRUK-{point_idx:03d}",
                    "hashtag": ["PakSibukGa"],
                    "title": title,
                    "survey_type": "mission",
                    "mission_subtype": "struk_go",
                    "category": "Transaksi Retail & UMKM",
                    "station_cluster": st_id,
                    "station_name": st_name,
                    "description": desc,
                    "distance_m": dist_m,
                    "zone": "Core Pedestrian Zone (0-400m)" if dist_m <= 400 else "Primary Catchment (400-800m)",
                    "price_info": price,
                    "user": surveyors[(i + 2) % len(surveyors)],
                    "timestamp": f"2026-09-02 {10 + (i % 8):02d}:{5 + (i * 4) % 50:02d} WIB"
                },
            })
            point_idx += 1

        # 4. 16 Menu Go per station = 80 total
        for i in range(16):
            lat = base_lat + (rng.random() - 0.5) * 0.008
            lon = base_lon + (rng.random() - 0.5) * 0.008
            dist_m = int(abs(lat - base_lat) * 111000 + abs(lon - base_lon) * 111000)

            title, desc, price = menu_catalogs[i % len(menu_catalogs)]
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
                "properties": {
                    "id": f"SURV-MENU-{point_idx:03d}",
                    "hashtag": ["PakSibukGa"],
                    "title": title,
                    "survey_type": "mission",
                    "mission_subtype": "menu_go",
                    "category": "Daftar Menu & Kuliner",
                    "station_cluster": st_id,
                    "station_name": st_name,
                    "description": desc,
                    "distance_m": dist_m,
                    "zone": "Core Pedestrian Zone (0-400m)" if dist_m <= 400 else "Primary Catchment (400-800m)",
                    "price_info": price,
                    "user": surveyors[(i + 3) % len(surveyors)],
                    "timestamp": f"2026-09-02 {11 + (i % 7):02d}:{12 + (i * 5) % 45:02d} WIB"
                },
            })
            point_idx += 1

    return features
