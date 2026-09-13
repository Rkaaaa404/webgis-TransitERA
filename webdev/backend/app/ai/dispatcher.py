import os
import json
from typing import Dict, Any, List, Optional
from app.data.stations_data import STATIONS_DATA, get_weakest_dimension_score
from app.spatial.real_data_pipeline import compute_all_station_analytics
from app.schemas.ai import AIData, ViewState, ChartPayload

# Mapping dari dimension name → key di scores dict
_DIM_KEY_MAP: Dict[str, str] = {
    "Density": "density",
    "Diversity": "diversity",
    "Design": "design",
    "Destination Accessibility": "destination_accessibility",
    "Distance to Transit": "distance_to_transit",
}


# Mapping koordinat dan koneksi intermoda landmark / tempat populer di Surabaya
SURABAYA_LANDMARKS: Dict[str, Dict[str, Any]] = {
    "tunjungan_plaza": {
        "name": "Tunjungan Plaza (TP Surabaya)",
        "longitude": 112.7390,
        "latitude": -7.2620,
        "hub_connections": {
            "gubeng": "1. Jalan kaki 3 menit (180m) dari pintu Stasiun Gubeng ke Halte Gubeng Pojok.\n2. Naik Feeder WiraWiri FD07 arah Pasar Turi (5 halte, ~9 mnt, 2.1 km).\n3. Turun di Halte Kaliasin / Tunjungan Plaza lalu jalan kaki 2 menit menyeberang ke lobby TP.",
            "pasar_turi": "1. Jalan kaki 1 menit (50m) ke Halte Gate St. Pasar Turi.\n2. Naik Feeder WiraWiri FD01 arah Balai Pemuda via Tunjungan (3 halte, ~7 mnt, 1.8 km).\n3. Turun langsung di Halte Tunjungan Plaza.",
            "wonokromo": "1. Jalan kaki 3 menit ke Halte Wonokromo / Terminal Intermoda Joyoboyo (TIJ).\n2. Naik Suroboyo Bus Koridor 1 (R1) arah Rajawali (7 halte, ~15 mnt, 4.6 km).\n3. Turun di Halte Kaliasin / Tunjungan Plaza.",
            "semut": "1. Jalan kaki 2 menit ke Halte Stasiun Surabaya Kota (Semut).\n2. Naik Feeder WiraWiri FD04 atau Suroboyo Bus arah Tunjungan (~10 mnt).\n3. Turun di Halte Siola Tunjungan lalu jalan kaki 4 menit ke TP.",
            "waru": "1. Naik KRL Komuter Surabaya dari Stasiun Waru ke Stasiun Surabaya Gubeng (~15 mnt).\n2. Dari Stasiun Gubeng, sambung Feeder WiraWiri FD07 langsung ke Tunjungan Plaza (~9 mnt) ATAU naik Suroboyo Bus Koridor 1 langsung dari Terminal Purabaya (~25 mnt) ke Halte Basuki Rahmat / TP.",
            "benowo": "1. Naik KA Komuter Lintas Barat dari Stasiun Benowo ke Stasiun Surabaya Pasar Turi (~18 mnt).\n2. Dari Stasiun Pasar Turi, sambung Feeder WiraWiri FD01 langsung ke Halte Tunjungan Plaza (~7 mnt).",
            "tandes": "1. Naik KA Komuter atau Feeder WiraWiri FD01 ke Stasiun Pasar Turi / Tunjungan (~15 mnt).",
            "kandangan": "1. Naik KA Komuter Lintas Barat ke Stasiun Pasar Turi (~14 mnt), sambung Feeder FD01 ke TP."
        },
        "default_directions": "Gunakan Feeder WiraWiri FD07 (dari koridor Gubeng), Feeder FD01 (dari koridor Pasar Turi), atau Suroboyo Bus Koridor 1 (dari koridor Wonokromo/Purabaya) turun di Halte Tunjungan Plaza."
    },
    "grand_city": {
        "name": "Grand City Mall & Balai Kota",
        "longitude": 112.7505,
        "latitude": -7.2610,
        "hub_connections": {
            "gubeng": "1. Jalan kaki 2 menit ke Halte Stasiun Gubeng Barat.\n2. Naik Feeder WiraWiri FD02 arah Balai Kota (2 halte, ~5 mnt) atau jalan kaki langsung ~8 menit (700m) menyusuri Jl. Kusuma Bangsa menuju Grand City.",
        },
        "default_directions": "Gunakan Feeder WiraWiri FD02 atau akses jalur pedestrian langsung dari Stasiun Gubeng."
    },
    "gelora_bung_tomo": {
        "name": "Stadion Gelora Bung Tomo (GBT)",
        "longitude": 112.6150,
        "latitude": -7.2345,
        "hub_connections": {
            "benowo": "1. Jalan kaki 1 menit (80m) ke Halte St. Benowo.\n2. Naik Shuttle Feeder WiraWiri FD-01C / FD08 langsung ke Gerbang Utama Stadion GBT (~6 mnt, 2.6 km).\n3. Tiba tepat di pintu masuk stadion.",
            "kandangan": "1. Naik KA Komuter ke Stasiun Benowo (6 mnt).\n2. Sambung Shuttle WiraWiri FD-01C langsung ke GBT (6 mnt).",
            "tandes": "1. Naik KA Komuter Lintas Barat ke Stasiun Benowo (11 mnt), lalu sambung Shuttle WiraWiri GBT (6 mnt)."
        },
        "default_directions": "Gunakan Shuttle Feeder WiraWiri FD-01C langsung dari Stasiun Benowo (~6 menit)."
    },
    "rsud_soetomo": {
        "name": "RSUD Dr. Soetomo & UNAIR Kampus B",
        "longitude": 112.7580,
        "latitude": -7.2680,
        "hub_connections": {
            "gubeng": "1. Jalan kaki 2 menit ke Halte RSGM Prof. Moestopo.\n2. Naik Trans Semanggi R2 arah Kejawan (4 halte, ~7 mnt, 1.5 km).\n3. Tiba di Gate Dharmawangsa RSUD Dr. Soetomo & Kampus B UNAIR.",
        },
        "default_directions": "Naik Trans Semanggi Suroboyo Koridor 2 (R2) dari koridor Stasiun Gubeng."
    },
    "kbs": {
        "name": "Kebun Binatang Surabaya (KBS) & Terminal Joyoboyo",
        "longitude": 112.7368,
        "latitude": -7.2960,
        "hub_connections": {
            "wonokromo": "1. Keluar dari pintu barat/utara Stasiun Wonokromo.\n2. Jalan kaki langsung 4 menit (300m) melintasi Skywalk Sawunggaling menuju concourse TIJ dan gerbang selatan KBS (bebas hambatan kendaraan).",
        },
        "default_directions": "Akses pedestrian langsung via Skybridge Sawunggaling dari Stasiun Wonokromo."
    },
    "cito": {
        "name": "City of Tomorrow Mall (CITO)",
        "longitude": 112.7290,
        "latitude": -7.3465,
        "hub_connections": {
            "waru": "1. Jalan kaki 2 menit ke Halte Waru 1.\n2. Naik Suroboyo Bus Koridor 1 arah Rajawali (2 halte, ~4 mnt, 700m) ke lobby CITO Mall.",
            "kertomenanggal": "1. Jalan kaki 4 menit (300m) menyusuri jalur pedestrian frontage barat Jl. Ahmad Yani ke lobby CITO."
        },
        "default_directions": "Akses via Suroboyo Bus Koridor 1 atau jalan kaki dari Stasiun Waru / Kertomenanggal."
    },
    "royal_plaza": {
        "name": "Royal Plaza Surabaya",
        "longitude": 112.7348,
        "latitude": -7.3089,
        "hub_connections": {
            "wonokromo": "1. Keluar stasiun ke Jl. Ahmad Yani Frontage Barat.\n2. Jalan kaki santai 5 menit (400m) ke arah selatan menuju lobby utama Royal Plaza.",
        },
        "default_directions": "Jalan kaki 5 menit ke arah selatan dari Stasiun Wonokromo."
    },
    "tugu_pahlawan": {
        "name": "Monumen Tugu Pahlawan & Kawasan Heritage",
        "longitude": 112.7380,
        "latitude": -7.2460,
        "hub_connections": {
            "pasar_turi": "1. Jalan kaki ke Halte Gate St. Pasar Turi (1 mnt).\n2. Naik Feeder WiraWiri FD07 arah Bratang (2 halte, ~4 mnt, 900m) atau jalan kaki langsung 10 menit ke Tugu Pahlawan.",
            "semut": "1. Naik Feeder WiraWiri FD04 ke Halte Jembatan Merah (3 mnt), jalan kaki 3 menit ke Tugu Pahlawan."
        },
        "default_directions": "Gunakan Feeder WiraWiri FD07 dari Stasiun Pasar Turi atau FD04 dari Stasiun Semut."
    }
}

# Daftar layanan Feeder WiraWiri, Suroboyo Bus, dan KA Komuter per simpul stasiun transit
STATION_TRANSIT_SERVICES: Dict[str, List[Dict[str, str]]] = {
    "benowo": [
        {
            "code": "FD-01C",
            "name": "Feeder WiraWiri Rute 1C (St. Benowo ↔ GBT ↔ Romokalisari)",
            "operator": "WiraWiri Suroboyo (Dishub Kota Surabaya)",
            "trayek": "Stasiun Benowo ↔ Terminal Benowo ↔ Stadion GBT ↔ Mangrove Romokalisari",
            "frequency": "Setiap 12–15 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Umum) / Rp 2.500 (Pelajar) — Non-Tunai QRIS/Kartu",
            "key_stops": "Halte Stasiun Benowo, Shelter Terminal Benowo, Gerbang Utama GBT, Ekowisata Romokalisari"
        },
        {
            "code": "FD08 Shuttle",
            "name": "Shuttle Feeder WiraWiri GBT Terpadu",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Benowo ↔ Gelora Bung Tomo (Langsung Jalur Khusus)",
            "frequency": "Setiap 10 menit (intensif saat matchday/event)",
            "hours": "05:30 – 22:00 WIB",
            "fare": "Rp 5.000 (Gratis Transfer 2 Jam ke Feeder/Bus lain)",
            "key_stops": "Pintu Keluar St. Benowo, Drop-off Zona Barat GBT, Gate VIP GBT"
        },
        {
            "code": "Koridor 5",
            "name": "Suroboyo Bus Koridor 5 (Romokalisari ↔ TIJ Joyoboyo)",
            "operator": "Suroboyo Bus",
            "trayek": "Romokalisari Adventure Land ↔ Benowo ↔ Kandangan ↔ Tandes ↔ Mayangkara ↔ TIJ Joyoboyo",
            "frequency": "Setiap 15 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000 (Bisa bayar sampah botol plastik via Gobis)",
            "key_stops": "Halte Pasar Benowo, Halte Sememi, Stasiun Tandes, Terminal Intermoda Joyoboyo"
        },
        {
            "code": "KAI Commuter",
            "name": "KRD Komuter Lintas Barat (Surabaya Pasar Turi – Cepu)",
            "operator": "PT KAI Commuter (KCI)",
            "trayek": "Surabaya Pasar Turi ↔ Tandes ↔ Kandangan ↔ Benowo ↔ Cerme ↔ Duduk ↔ Lamongan ↔ Babat ↔ Bojonegoro ↔ Cepu",
            "frequency": "4–6 perjalanan/hari sesuai Gapeka",
            "hours": "05:00 – 20:30 WIB",
            "fare": "Rp 4.000 – Rp 13.000 (KAI Access / KMT)",
            "key_stops": "St. Benowo, St. Kandangan, St. Tandes, St. Surabaya Pasar Turi"
        }
    ],
    "gubeng": [
        {
            "code": "FD02",
            "name": "Feeder WiraWiri FD02 (Park & Ride Mayjend ↔ Balai Kota)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Park & Ride Mayjend Sungkono ↔ Darmo ↔ Stasiun Gubeng ↔ Grand City ↔ Balai Kota Surabaya",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:30 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Halte Gubeng Barat, Grand City Convex, Balai Pemuda, Balai Kota"
        },
        {
            "code": "FD07",
            "name": "Feeder WiraWiri FD07 (TIJ Joyoboyo ↔ Pasar Turi via Gubeng)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "TIJ Joyoboyo ↔ Bratang ↔ Stasiun Gubeng ↔ Tunjungan Plaza ↔ Stasiun Pasar Turi",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:30 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Halte Gubeng Pojok, Tunjungan Plaza, Siola, Stasiun Pasar Turi"
        },
        {
            "code": "FD10",
            "name": "Feeder WiraWiri FD10 (Keputih ITS ↔ Pasar Atom)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Terminal Keputih (ITS) ↔ Kertajaya ↔ Stasiun Gubeng ↔ ITC Mega Grosir ↔ Pasar Atom",
            "frequency": "Setiap 12 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Kampus ITS, RS Onkologi, St. Gubeng Baru, St. Surabaya Kota, Pasar Atom"
        },
        {
            "code": "R2 (Trans Semanggi)",
            "name": "Trans Semanggi Suroboyo Koridor 2 (Lidah Wetan ↔ ITS)",
            "operator": "Trans Semanggi Suroboyo (Teman Bus)",
            "trayek": "Kejawan Putih Tambak (ITS) ↔ RSUD Dr. Soetomo ↔ St. Gubeng ↔ Basuki Rahmat ↔ UNESA Lidah Wetan",
            "frequency": "Setiap 8–10 menit",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Rp 5.000 (Kartu e-Money / QRIS)",
            "key_stops": "Halte RSGM Moestopo, UNAIR Kampus A & B, RSUD Dr. Soetomo, Tunjungan"
        },
        {
            "code": "KRL Commuter Line",
            "name": "KRL Commuter Line Surabaya (Lintas Selatan & Malang)",
            "operator": "PT KAI Commuter",
            "trayek": "Surabaya Gubeng ↔ Ngagel ↔ Wonokromo ↔ Waru ↔ Gedangan ↔ Sidoarjo ↔ Bangil ↔ Malang / Blitar",
            "frequency": "Setiap 30–60 menit",
            "hours": "04:30 – 22:00 WIB",
            "fare": "Rp 4.000 – Rp 12.000",
            "key_stops": "St. Surabaya Gubeng, St. Wonokromo, St. Waru, St. Sidoarjo"
        }
    ],
    "wonokromo": [
        {
            "code": "FD03",
            "name": "Feeder WiraWiri FD03 (TIJ Joyoboyo ↔ Yos Sudarso)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Terminal Intermoda Joyoboyo ↔ Stasiun Wonokromo ↔ Darmo ↔ Bambu Runcing ↔ Yos Sudarso",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Skywalk TIJ, DTC Mall, Taman Bungkul, Balai Pemuda"
        },
        {
            "code": "FD04",
            "name": "Feeder WiraWiri FD04 (Penjaringan Sari ↔ Wonokromo)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Penjaringan Sari ↔ Rungkut Madya ↔ Jemursari ↔ Stasiun Wonokromo ↔ TIJ Joyoboyo",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "MERR Rungkut, UPN Veteran, Royal Plaza, Skywalk Sawunggaling"
        },
        {
            "code": "FD09",
            "name": "Feeder WiraWiri FD09 (Manukan ↔ TIJ Joyoboyo)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Terminal Manukan ↔ HR Muhammad ↔ Mayjend Sungkono ↔ Stasiun Wonokromo ↔ TIJ",
            "frequency": "Setiap 12 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Manukan, TVRI Jawa Timur, Ciputra World, DTC Wonokromo, TIJ"
        },
        {
            "code": "Koridor 1 (R1/R2)",
            "name": "Suroboyo Bus Koridor 1 (Terminal Purabaya ↔ Rajawali)",
            "operator": "Suroboyo Bus",
            "trayek": "Terminal Purabaya (Bungurasih) ↔ Waru ↔ Kertomenanggal ↔ Wonokromo ↔ Basuki Rahmat ↔ Rajawali",
            "frequency": "Setiap 8 menit",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Rp 5.000 (Bayar QRIS, Kartu, atau Botol Plastik)",
            "key_stops": "Halte Wonokromo, DTC Mall, Royal Plaza, Tunjungan Plaza, Jembatan Merah"
        },
        {
            "code": "Skybridge Sawunggaling",
            "name": "Integrasi Intermoda Skybridge Sawunggaling",
            "operator": "Dishub Surabaya & PT KAI",
            "trayek": "Peron Stasiun Wonokromo ↔ Concourse Bus Terminal Joyoboyo ↔ Kebun Binatang Surabaya (KBS)",
            "frequency": "Jalur pejalan kaki kontinu berkanopi",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Gratis (Fasilitas Pejalan Kaki Ramah Disabilitas)",
            "key_stops": "Lobby Lantai 2 Stasiun Wonokromo, Halte Bus TIJ Lantai 1, Gerbang Selatan KBS"
        }
    ],
    "pasar_turi": [
        {
            "code": "FD01",
            "name": "Feeder WiraWiri FD01 (St. Pasar Turi ↔ Tunjungan ↔ Balai Pemuda)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Pasar Turi ↔ Siola Tunjungan ↔ Tunjungan Plaza ↔ Balai Pemuda ↔ Alun-Alun Surabaya",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Halte Pasar Turi, Siola, Tunjungan Plaza, Balai Pemuda"
        },
        {
            "code": "FD07",
            "name": "Feeder WiraWiri FD07 (Terminal Bratang ↔ St. Pasar Turi)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Terminal Bratang ↔ Manyar ↔ Stasiun Gubeng ↔ BG Junction ↔ Stasiun Pasar Turi",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:30 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "Bratang, Gubeng Pojok, Pasar Turi Baru, PGS (Pusat Grosir Surabaya)"
        },
        {
            "code": "Koridor 1 & R3",
            "name": "Suroboyo Bus Koridor 1 & R3 (Purabaya ↔ Pasar Turi ↔ Rajawali)",
            "operator": "Suroboyo Bus",
            "trayek": "Terminal Purabaya ↔ Darmo ↔ Embong Malang ↔ Pasar Turi ↔ Jembatan Merah",
            "frequency": "Setiap 10 menit",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "Halte Pasar Turi, PGS, Tugu Pahlawan, Jembatan Merah"
        }
    ],
    "waru": [
        {
            "code": "FD06",
            "name": "Feeder WiraWiri FD06 (TIJ Joyoboyo ↔ Waru ↔ Bandara Juanda)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "TIJ Joyoboyo ↔ Stasiun Wonokromo ↔ Stasiun Waru ↔ Aloha ↔ Bandara Internasional Juanda T1",
            "frequency": "Setiap 15 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "St. Waru, Terminal Purabaya, Aloha, Bandara Juanda Terminal 1"
        },
        {
            "code": "FD12",
            "name": "Feeder WiraWiri FD12 (St. Waru ↔ Rungkut Industri)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Waru ↔ Berbek Industri ↔ SIER Rungkut ↔ Kampus UPN Veteran",
            "frequency": "Setiap 15 menit",
            "hours": "05:30 – 20:30 WIB",
            "fare": "Rp 5.000 (Integrasi 2 Jam)",
            "key_stops": "St. Waru, SIER Rungkut, Rungkut Madya, UPN"
        },
        {
            "code": "Koridor 1",
            "name": "Suroboyo Bus Koridor 1 (Purabaya ↔ Rajawali)",
            "operator": "Suroboyo Bus",
            "trayek": "Terminal Purabaya ↔ Halte Waru 1 ↔ Cito Mall ↔ Wonokromo ↔ Rajawali",
            "frequency": "Setiap 8 menit",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "Terminal Purabaya, Halte Waru 1, CITO Mall, Royal Plaza"
        },
        {
            "code": "Skybridge Bungurasih",
            "name": "Skybridge Intermoda Stasiun Waru – Terminal Purabaya",
            "operator": "Dishub Jatim & PT KAI",
            "trayek": "Peron KRL Stasiun Waru ↔ Concourse Bus Antarkota Terminal Purabaya",
            "frequency": "Akses pedestrian layang kontinu 24 Jam",
            "hours": "24 Jam",
            "fare": "Gratis",
            "key_stops": "Gate Timur Stasiun Waru, Concourse Bus AKAP/AKDP Bungurasih"
        }
    ],
    "semut": [
        {
            "code": "FD04",
            "name": "Feeder WiraWiri FD04 (St. Kota Semut ↔ Jembatan Merah)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Surabaya Kota (Semut) ↔ Zona Eropa Kota Lama ↔ Jembatan Merah ↔ Pasar Atom",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Surabaya Kota, Museum Sampoerna, Jembatan Merah Plaza, Pasar Atom"
        },
        {
            "code": "FD10",
            "name": "Feeder WiraWiri FD10 (Keputih ↔ Gubeng ↔ Semut / Pasar Atom)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Terminal Keputih ↔ Gubeng ↔ Stasiun Surabaya Kota ↔ Pasar Atom Mall",
            "frequency": "Setiap 12 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "Pasar Atom, Semut Megah Plaza, Stasiun Gubeng"
        }
    ],
    "tandes": [
        {
            "code": "FD-01",
            "name": "Feeder WiraWiri FD-01 (St. Tandes ↔ Manukan Lor ↔ Benowo)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Tandes ↔ Balongsari ↔ Sentra Kuliner Manukan ↔ Terminal Manukan ↔ Benowo",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Tandes, Balongsari, Sentra Kuliner Manukan, Terminal Benowo"
        },
        {
            "code": "Koridor 5",
            "name": "Suroboyo Bus Koridor 5 (Romokalisari ↔ TIJ Joyoboyo)",
            "operator": "Suroboyo Bus",
            "trayek": "Romokalisari ↔ Benowo ↔ Kandangan ↔ Tandes ↔ Mayangkara ↔ TIJ Joyoboyo",
            "frequency": "Setiap 15 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000",
            "key_stops": "Halte Stasiun Tandes, Margomulyo, TIJ Joyoboyo"
        }
    ],
    "kandangan": [
        {
            "code": "FD-01B",
            "name": "Feeder WiraWiri FD-01B (St. Kandangan ↔ Sememi ↔ Pakal)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "Stasiun Kandangan ↔ Pasar Sememi ↔ Polsek Pakal ↔ Kecamatan Benowo",
            "frequency": "Setiap 15 menit",
            "hours": "05:30 – 20:30 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Kandangan, Pasar Sememi, Polsek Pakal"
        },
        {
            "code": "Koridor 5",
            "name": "Suroboyo Bus Koridor 5 (Romokalisari ↔ TIJ Joyoboyo)",
            "operator": "Suroboyo Bus",
            "trayek": "Romokalisari ↔ Benowo ↔ Kandangan ↔ Tandes ↔ TIJ Joyoboyo",
            "frequency": "Setiap 15 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Kandangan, Sememi, TIJ Joyoboyo"
        }
    ],
    "ngagel": [
        {
            "code": "FD03",
            "name": "Feeder WiraWiri FD03 (TIJ Joyoboyo ↔ Ngagel ↔ Yos Sudarso)",
            "operator": "WiraWiri Suroboyo",
            "trayek": "TIJ Joyoboyo ↔ Stasiun Ngagel ↔ Marvell City ↔ Jl. Sulawesi ↔ Yos Sudarso",
            "frequency": "Setiap 10 menit",
            "hours": "05:30 – 21:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Ngagel, Marvell City Mall, Kampus UBAYA Ngagel, Bambu Runcing"
        }
    ],
    "margorejo": [
        {
            "code": "K2L (Trans Semanggi)",
            "name": "Trans Semanggi Suroboyo Koridor 2L (Margorejo ↔ Lidah Wetan)",
            "operator": "Trans Semanggi Suroboyo",
            "trayek": "Stasiun Margorejo ↔ Polda Jatim ↔ Taman Pelangi ↔ Royal Plaza ↔ UNESA Lidah Wetan",
            "frequency": "Setiap 10 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Margorejo, Polda Jatim, Taman Pelangi, Royal Plaza"
        }
    ],
    "jemursari": [
        {
            "code": "K2L (Trans Semanggi)",
            "name": "Trans Semanggi Suroboyo Koridor 2L (Jemursari ↔ Rungkut Industri)",
            "operator": "Trans Semanggi Suroboyo",
            "trayek": "Stasiun Jemursari ↔ Plaza Marina ↔ Jemur Ngawinan ↔ SIER Rungkut Industri",
            "frequency": "Setiap 10 menit",
            "hours": "05:00 – 21:30 WIB",
            "fare": "Rp 5.000",
            "key_stops": "St. Jemursari, Plaza Marina, SIER Industri"
        }
    ],
    "kertomenanggal": [
        {
            "code": "Koridor 1",
            "name": "Suroboyo Bus Koridor 1 (Purabaya ↔ Rajawali)",
            "operator": "Suroboyo Bus",
            "trayek": "Terminal Purabaya ↔ St. Kertomenanggal ↔ Cito Mall ↔ Wonokromo ↔ Rajawali",
            "frequency": "Setiap 8 menit",
            "hours": "05:00 – 22:00 WIB",
            "fare": "Rp 5.000",
            "key_stops": "Halte Kertomenanggal, Cito Mall, Terminal Purabaya"
        }
    ]
}


def _get_station_data(station_id: str) -> Dict[str, Any]:
    st_id = (station_id or "gubeng").lower().strip()
    try:
        all_st = compute_all_station_analytics()
        if st_id in all_st:
            return all_st[st_id]
    except Exception:
        pass
    return STATIONS_DATA.get(st_id, STATIONS_DATA["gubeng"])



def dispatch_spatial_function(func_name: str, args: Dict[str, Any]) -> AIData:
    """
    Mengeksekusi nama tool yang dipilih Gemini dan membangun dual-output payload.
    Setiap function handler mengembalikan:
      - json_response → AIData dengan action & view_state (untuk manipulasi peta)
      - text_response → Narasi analitik human-readable
    """
    if func_name == "get_tod_score":
        st_id = args.get("station_id", "gubeng").lower()
        station = _get_station_data(st_id)
        weakest_score = get_weakest_dimension_score(station)
        strongest_key = _DIM_KEY_MAP.get(station["strongest_dimension"], "destination_accessibility")
        strongest_score = station["scores"].get(strongest_key, 0.0)

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_tod_score",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5,
                pitch=30.0
            ),
            filter_query={"station_id": st_id},
            chart_payload=ChartPayload(
                type="radar_5d",
                title=f"Analisis 5D TOD — {station['name']}",
                data={
                    "station_name": station["name"],
                    "scores": station["scores"],
                    "benchmark": station["benchmark_scores"],
                    "tod_readiness_score": station["tod_readiness_score"]
                }
            ),
            text_response=(
                f"Kawasan **{station['name']}** memiliki **TOD Readiness Score {station['tod_readiness_score']}** "
                f"({station['status']}) dengan tipologi **{station['typology']}**. "
                f"Dimensi terkuat adalah *{station['strongest_dimension']}* ({strongest_score:.1f}/100), "
                f"sementara dimensi terlemah adalah *{station['weakest_dimension']}* ({weakest_score:.1f}/100). "
                f"Rekomendasi: {station['policy_recommendations'][0]}"
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "compare_stations":
        st_a = args.get("station_a", "gubeng").lower()
        st_b = args.get("station_b", "wonokromo").lower()
        data_a = _get_station_data(st_a)
        data_b = _get_station_data(st_b)

        mid_lon = round((data_a["longitude"] + data_b["longitude"]) / 2, 6)
        mid_lat = round((data_a["latitude"] + data_b["latitude"]) / 2, 6)
        delta = round(data_a["tod_readiness_score"] - data_b["tod_readiness_score"], 1)
        higher = data_a["name"] if delta >= 0 else data_b["name"]

        return AIData(
            action="compare_stations",
            target_layer="h3_tod_score",
            target_station=st_a,
            view_state=ViewState(center=[mid_lon, mid_lat], zoom=12.5),
            chart_payload=ChartPayload(
                type="radar_comparison",
                title=f"Komparasi: {data_a['name']} vs {data_b['name']}",
                data={
                    "station_a": {
                        "name": data_a["name"],
                        "scores": data_a["scores"],
                        "overall": data_a["tod_readiness_score"]
                    },
                    "station_b": {
                        "name": data_b["name"],
                        "scores": data_b["scores"],
                        "overall": data_b["tod_readiness_score"]
                    }
                }
            ),
            text_response=(
                f"Perbandingan 5D TOD: **{data_a['name']}** meraih skor **{data_a['tod_readiness_score']}**, "
                f"sedangkan **{data_b['name']}** meraih skor **{data_b['tod_readiness_score']}** "
                f"(selisih {abs(delta)} poin). **{higher}** lebih unggul pada aspek konektivitas dan "
                f"percampuran guna lahan komersial. Dimensi *Design* (jalur pedestrian) menjadi "
                f"faktor yang paling membutuhkan alokasi intervensi di kedua simpul."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_weakest_dimension":
        st_id = args.get("station_id", "pasar_turi").lower()
        station = _get_station_data(st_id)
        weakest_name = station["weakest_dimension"]
        weakest_score = get_weakest_dimension_score(station)
        weakest_benchmark_key = _DIM_KEY_MAP.get(weakest_name, "design")
        benchmark_score = station["benchmark_scores"].get(weakest_benchmark_key, 0.0)

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_tod_score",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5
            ),
            text_response=(
                f"Dimensi TOD terlemah di **{station['name']}** adalah **{weakest_name}** "
                f"dengan skor hanya **{weakest_score:.1f} / 100** "
                f"(di bawah rata-rata koridor {benchmark_score:.1f}). "
                f"Penyebab utama berdasarkan data survei lapangan adalah kualitas infrastruktur "
                f"pejalan kaki yang belum merata dan minimnya fasilitas pendukung. "
                f"Prioritas intervensi: {station['policy_recommendations'][0]}"
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_njop_premium":
        st_id = args.get("station_id", "waru").lower()
        station = _get_station_data(st_id)
        njop = station["njop_premium"]

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_njop_premium",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.2
            ),
            filter_query={"station_id": st_id, "layer": "njop_premium"},
            chart_payload=ChartPayload(
                type="njop_premium_stats",
                title=f"Estimasi Premium NJOP — {station['name']}",
                data=njop
            ),
            text_response=(
                f"Berdasarkan Spatial Durbin Model, simpul transit di sekitar **{station['name']}** "
                f"diestimasikan berasosiasi dengan kenaikan nilai tanah (**%ΔNJOP**) rata-rata "
                f"**+{njop['avg_njop_premium_pct']}%** "
                f"(Interval Kepercayaan 95%: **{njop['ci_lower_pct']}% s.d. {njop['ci_upper_pct']}%**). "
                f"Dampak langsung lokal: +{njop['direct_effect_pct']}%, "
                f"limpahan spasial (*spillover*): +{njop['spillover_effect_pct']}%."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "filter_layer":
        layer = args.get("target_layer", "survey_mission_menu")
        kondisi = args.get("kondisi", "ramai")

        return AIData(
            action="filter_layer",
            target_layer=layer,
            view_state=ViewState(center=[112.7521, -7.2654], zoom=13.0),
            filter_query={"layer": layer, "condition": kondisi},
            text_response=(
                f"Menampilkan filter layer **{layer}** dengan kriteria **'{kondisi}'**. "
                f"Peta telah disesuaikan untuk menampilkan sebaran merchant kuliner Menu Go "
                f"yang memiliki tingkat keramaian tinggi di sekitar koridor stasiun SRRL Surabaya."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "simulate_scenario":
        sc_id = args.get("scenario_id", "extend_feeder_waru")

        return AIData(
            action="show_scenario",
            target_layer="h3_tod_score",
            target_station="waru",
            view_state=ViewState(center=[112.7297, -7.3519], zoom=14.0),
            chart_payload=ChartPayload(
                type="scenario_impact",
                title="Simulasi Intervensi Feeder Waru",
                data={
                    "baseline_score": 68.3,
                    "simulated_score": 75.8,
                    "delta_score": 7.5,
                    "baseline_njop": 8.2,
                    "simulated_njop": 11.4,
                    "delta_njop": 3.2
                }
            ),
            text_response=(
                f"Simulasi skenario **Perluasan Feeder WiraWiri ke Stasiun Waru** "
                f"menunjukkan peningkatan TOD Readiness Score dari **68,3 menjadi 75,8 (+7,5 poin)**. "
                f"Dimensi *Distance to Transit* dan *Diversity* mengalami kenaikan paling signifikan. "
                f"Estimasi %ΔNJOP diproyeksikan dari 8,2% menjadi **11,4% (+3,2% apresiasi tambahan)**."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "site_recommendation":
        biz = args.get("business_type", "coffee_shop")
        biz_label = biz.replace("_", " ").title()

        return AIData(
            action="site_recommendation",
            target_layer="survey_mission_menu",
            target_station="wonokromo",
            view_state=ViewState(center=[112.7383, -7.3014], zoom=14.5),
            chart_payload=ChartPayload(
                type="spending_cluster",
                title="Profil Daya Beli & Keramaian",
                data={
                    "recommended_station": "Stasiun Wonokromo",
                    "h3_index": "898d80824cbffff",
                    "avg_spending": 38500,
                    "market_density": "Tinggi",
                    "competitor_count": 4
                }
            ),
            text_response=(
                f"Untuk membuka usaha **{biz_label}**, lokasi terbaik adalah sekitar "
                f"**Stasiun Wonokromo (Grid Sel H3: 898d80824cbffff)** radius 250m dari pintu utara. "
                f"Rata-rata transaksi Struk Go Rp 38.500/orang, percampuran guna lahan komersial aktif, "
                f"dan tingginya pergerakan komuter harian meminimalkan risiko *tenant mismatch*."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_survey_data":
        st_id = str(args.get("station_id", "wonokromo")).lower().strip()
        cat = str(args.get("category", "all")).lower().strip()
        station = _get_station_data(st_id)

        # Muat ringkasan sentimen survei jika ada
        sentiment_summary_path = os.path.join(os.path.dirname(__file__), "..", "data", "survey_sentiment_summary.json")
        st_sentiment = {}
        if os.path.exists(sentiment_summary_path):
            try:
                with open(sentiment_summary_path, "r", encoding="utf-8") as f:
                    st_sentiment = json.load(f).get("stations", {}).get(st_id, {})
            except Exception:
                pass

        respondents = st_sentiment.get("respondent_count", 35 if st_id == "wonokromo" else 20)
        pos_pct = st_sentiment.get("sentiment", {}).get("positive_pct", 55)
        neg_pct = st_sentiment.get("sentiment", {}).get("negative_pct", 15)

        if cat == "economy" or st_id == "wonokromo":
            text = (
                f"### Profil Ekonomi & Survei Warga Sekitar {station['name']}\n\n"
                f"Berdasarkan data aktivitas survei lapangan **GEO MAPID #PakSibukGa** ({respondents} titik observasi terverifikasi) "
                f"dan data transaksi merchant kawasan:\n\n"
                f"1. **Pusat Perbelanjaan & Retail Sekunder**: Koridor stasiun berhadapan langsung dengan **Darmo Trade Center (DTC) Mall** "
                f"(jarak ~150–450m) dan **Royal Plaza Surabaya** (~800m), yang menjadi magnet belanja grosir dan retail utama komuter harian.\n"
                f"2. **Daya Beli & Transaksi (Struk Go & Menu Go)**: Rata-rata nilai belanja komuter di merchant sekitar simpul adalah **Rp 38.500 per transaksi**, "
                f"dengan dominasi kategori makanan/minuman to-go dan kebutuhan harian cepat saji.\n"
                f"3. **Aktivitas UMKM & PKL**: Survei mencatat konsentrasi PKL aktif di sepanjang Jl. Stasiun Wonokromo (kuliner siang hingga malam). "
                f"Sebagian titik memerlukan penataan trotoar agar tidak menyempitkan jalur pejalan kaki.\n"
                f"4. **Diversitas & Status Ekonomi**: Diversitas guna lahan meraih skor **{station['scores']['diversity']}/100**, "
                f"didukung status sosial ekonomi (SES) menengah produktif (C1–B) dan konektivitas feeder WiraWiri rute FD03 langsung ke Terminal Joyoboyo."
            )
        else:
            text = (
                f"### Hasil Survei Warga MAPID — {station['name']}\n\n"
                f"Dari total **{respondents} responden/titik survei** di koridor {station['name']}:\n"
                f"- **Sentimen Positif**: {pos_pct}% (Apresiasi kemudahan tap-in dan integrasi antarmoda)\n"
                f"- **Masukan Warga**: {neg_pct}% (Fokus pada perbaikan trotoar berkanopi dan penerangan PJU malam hari)\n"
                f"- **Indeks Walkability Spasial**: {station.get('walkability', {}).get('score', station['scores']['design'])}/100 "
                f"({station.get('walkability', {}).get('label', 'Cukup Nyaman')})\n"
                f"- **Data Provenance**: Terverifikasi melalui kampanye GEO MAPID #PakSibukGa 2026."
            )

        return AIData(
            action="highlight_and_zoom",
            target_layer="survey_activity",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=15.0,
                pitch=35.0
            ),
            filter_query={"station_cluster": st_id, "category": cat},
            chart_payload=ChartPayload(
                type="spending_cluster",
                title=f"Karakteristik Survei & Ekonomi — {station['name']}",
                data={
                    "station_name": station["name"],
                    "respondents": respondents,
                    "positive_pct": pos_pct,
                    "avg_spending": 38500 if st_id == "wonokromo" else 42000,
                    "diversity_score": station["scores"]["diversity"],
                    "walkability_score": station["scores"]["design"]
                }
            ),
            text_response=text,
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_area_score":
        st_id = str(args.get("station_id", "wonokromo")).lower().strip()
        station = _get_station_data(st_id)
        scores = station["scores"]
        walk_info = station.get("walkability", {})
        walk_score = walk_info.get("score", scores["design"])

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_tod_score",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5,
                pitch=30.0
            ),
            chart_payload=ChartPayload(
                type="radar_5d",
                title=f"Skor Kesiapan 5D TOD — {station['name']}",
                data={
                    "station_name": station["name"],
                    "scores": scores,
                    "benchmark": station["benchmark_scores"],
                    "tod_readiness_score": station["tod_readiness_score"]
                }
            ),
            text_response=(
                f"### Analisis Kesiapan 5D TOD — {station['name']}\n\n"
                f"- **TOD Readiness Score**: **{station['tod_readiness_score']} / 100** ({station['status']})\n"
                f"- **Density (D1)**: {scores['density']} / 100 (Kepadatan penduduk BPS)\n"
                f"- **Diversity (D2)**: {scores['diversity']} / 100 (Percampuran guna lahan & harga properti)\n"
                f"- **Design / Walkability (D3)**: {scores['design']} / 100 ({walk_info.get('label', 'Cukup Nyaman')})\n"
                f"- **Destination Accessibility (D4)**: {scores['destination_accessibility']} / 100 (Akses ke CBD & pusat perbelanjaan)\n"
                f"- **Distance to Transit (D5)**: {scores['distance_to_transit']} / 100 (Jangkauan feeder WiraWiri & halte transit)\n\n"
                f"*Catatan Standar Metodologi*: Mengacu pada kerangka 5D TOD internasional (Ewing & Cervero 2010 / Permen ATR/BPN No. 16/2017)."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_route":
        orig = str(args.get("origin", "gubeng")).lower().strip().replace("-", "_").replace(" ", "_")
        dest_raw = str(args.get("destination", "tunjungan_plaza")).lower().strip()

        # Deteksi apakah tujuan adalah landmark populer Surabaya
        landmark_key = None
        for k in SURABAYA_LANDMARKS.keys():
            if k in dest_raw or k.replace("_", " ") in dest_raw or dest_raw in k:
                landmark_key = k
                break
        if not landmark_key:
            if "tunjungan" in dest_raw or "tp" in dest_raw:
                landmark_key = "tunjungan_plaza"
            elif "gbt" in dest_raw or "bung tomo" in dest_raw:
                landmark_key = "gelora_bung_tomo"
            elif "grand city" in dest_raw:
                landmark_key = "grand_city"
            elif "soetomo" in dest_raw or "unair" in dest_raw:
                landmark_key = "rsud_soetomo"
            elif "kbs" in dest_raw or "kebun binatang" in dest_raw or "joyoboyo" in dest_raw:
                landmark_key = "kbs"
            elif "cito" in dest_raw:
                landmark_key = "cito"
            elif "royal" in dest_raw:
                landmark_key = "royal_plaza"
            elif "pahlawan" in dest_raw or "pgs" in dest_raw:
                landmark_key = "tugu_pahlawan"

        st_orig = _get_station_data(orig)

        if landmark_key:
            lm = SURABAYA_LANDMARKS[landmark_key]
            mid_lon = round((st_orig["longitude"] + lm["longitude"]) / 2, 5)
            mid_lat = round((st_orig["latitude"] + lm["latitude"]) / 2, 5)

            connection_info = lm["hub_connections"].get(orig, lm["default_directions"])

            return AIData(
                action="show_route",
                target_station=orig,
                view_state=ViewState(center=[mid_lon, mid_lat], zoom=13.0),
                filter_query={"origin": orig, "destination": landmark_key},
                chart_payload=ChartPayload(
                    type="route_plan",
                    title=f"Rute Intermoda: {st_orig['name']} ➔ {lm['name']}",
                    data={
                        "origin": st_orig["name"],
                        "destination": lm["name"],
                        "fare": "Rp 5.000 (Non-Tunai / Integrasi 2 Jam)",
                        "est_time": "12–18 menit"
                    }
                ),
                text_response=(
                    f"### Panduan Rute Intermoda Tercepat: {st_orig['name']} ➔ {lm['name']}\n\n"
                    f"**Rekomendasi Transit Terpilih:**\n"
                    f"{connection_info}\n\n"
                    f"- **Tarif Perjalanan**: **Rp 5.000** (Metode: QRIS / Kartu Uang Elektronik Flazz/e-Money/Brizzi/TapCash).\n"
                    f"- **Sistem Integrasi**: Nikmati **Gratis Transfer 2 Jam** jika melanjutkan perjalanan antarmoda dengan Suroboyo Bus / Feeder WiraWiri lainnya.\n"
                    f"- **Estimasi Total Waktu**: **~12–18 menit** (termasuk transfer).\n\n"
                    f"*Rute telah diproyeksikan pada kanvas peta TransitERA.*"
                ),
                function_called=func_name,
                function_args=args
            )
        else:
            # Tujuan berupa stasiun transit SRRL / KAI
            st_dest = _get_station_data(dest_raw)
            mid_lon = round((st_orig["longitude"] + st_dest["longitude"]) / 2, 5)
            mid_lat = round((st_orig["latitude"] + st_dest["latitude"]) / 2, 5)

            return AIData(
                action="show_route",
                target_station=dest_raw,
                view_state=ViewState(center=[mid_lon, mid_lat], zoom=12.0),
                filter_query={"origin": orig, "destination": dest_raw},
                chart_payload=ChartPayload(
                    type="route_plan",
                    title=f"Rute Transit: {st_orig['name']} ➔ {st_dest['name']}",
                    data={
                        "origin": st_orig["name"],
                        "destination": st_dest["name"],
                        "fare": "Rp 4.000 - Rp 5.000",
                        "est_time": "25–35 menit"
                    }
                ),
                text_response=(
                    f"### Rekomendasi Rute Multimoda: {st_orig['name']} ➔ {st_dest['name']}\n\n"
                    f"1. **Leg 1 (Jalan Kaki - 3 mnt)**: Keluar dari gate {st_orig['name']} menuju peron transit / halte pengumpan.\n"
                    f"2. **Leg 2 (Transit KRL Komuter / Bus)**: Naik KRL Komuter Surabaya atau Feeder WiraWiri langsung antar-koridor.\n"
                    f"3. **Leg 3 (Jalan Kaki - 3 mnt)**: Tiba di {st_dest['name']} melalui concourse pedestrian terpadu.\n\n"
                    f"- **Estimasi Waktu Tempuh**: **~25–35 menit**.\n"
                    f"- **Tarif Terpadu**: Mulai dari **Rp 4.000** (KAI Commuter) s.d. **Rp 5.000** (WiraWiri / Suroboyo Bus dengan free transfer 2 jam).\n\n"
                    f"*Peta telah memperbesar koridor konektivitas antarkedua stasiun.*"
                ),
                function_called=func_name,
                function_args=args
            )

    elif func_name == "get_transit_services":
        st_id = str(args.get("station_id", "benowo")).lower().strip().replace("-", "_").replace(" ", "_")
        station = _get_station_data(st_id)
        services = STATION_TRANSIT_SERVICES.get(st_id, STATION_TRANSIT_SERVICES.get("benowo", []))

        route_list_text = []
        for idx, s in enumerate(services, 1):
            route_list_text.append(
                f"**{idx}. {s['code']} — {s['name']}** ({s['operator']})\n"
                f"   - **Rute/Trayek**: {s['trayek']}\n"
                f"   - **Frekuensi & Jam**: {s['frequency']} | Operasional: {s['hours']}\n"
                f"   - **Tarif**: {s['fare']}\n"
                f"   - **Pemberhentian/Koneksi Utama**: {s['key_stops']}"
            )

        formatted_routes = "\n\n".join(route_list_text)

        return AIData(
            action="show_transit_routes",
            target_layer="transit_routes",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5,
                pitch=35.0
            ),
            filter_query={"station_id": st_id, "layer": "transit_routes"},
            chart_payload=ChartPayload(
                type="transit_services",
                title=f"Layanan Feeder & Bus — {station['name']}",
                data={
                    "station_id": st_id,
                    "station_name": station["name"],
                    "service_count": len(services),
                    "services": services
                }
            ),
            text_response=(
                f"### Layanan Feeder WiraWiri & Suroboyo Bus di {station['name']}\n\n"
                f"Simpul **{station['name']}** terintegrasi dengan jaringan transportasi pengumpan (*feeder*) "
                f"dan bus perkotaan Surabaya sebagai berikut:\n\n"
                f"{formatted_routes}\n\n"
                f"> **Sistem Integrasi Tarif**: Penumpang mendapatkan **Transfer Gratis 2 Jam** antarmoda Feeder WiraWiri, Suroboyo Bus, "
                f"dan Trans Semanggi menggunakan pembayaran non-tunai (QRIS & Kartu Uang Elektronik)."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_fare_and_payment_info":
        return AIData(
            action="default_narrative",
            target_layer="transit_routes",
            text_response=(
                f"### Tarif, Cara Bayar, & Sistem Integrasi Transportasi Massal Surabaya\n\n"
                f"1. **Skema Tarif Resmi (Perwali Surabaya)**:\n"
                f"   - **Umum**: **Rp 5.000** per perjalanan.\n"
                f"   - **Pelajar & Mahasiswa**: **Rp 2.500** per perjalanan (menunjukkan kartu pelajar/KTM aktif).\n"
                f"   - **Gratis (Rp 0)**: Lansia usia 60 tahun ke atas, veteran kemerdekaan, anak di bawah 3 tahun, dan penyandang disabilitas.\n\n"
                f"2. **Sistem Integrasi Gratis Transfer 2 Jam (Free Transfer Rule)**:\n"
                f"   - Penumpang yang melakukan tap-in menggunakan metode pembayaran non-tunai (QRIS atau Kartu Uang Elektronik) "
                f"dapat **berpindah moda secara GRATIS** antara Suroboyo Bus, Feeder WiraWiri, dan Trans Semanggi Suroboyo dalam kurun waktu **2 jam (120 menit)** sejak tap-in pertama.\n"
                f"   - Cukup tempelkan kartu atau scan QRIS yang sama pada armada lanjutan; saldo Anda tidak akan terpotong ulang.\n\n"
                f"3. **Metode Pembayaran (100% Non-Tunai)**:\n"
                f"   - **QRIS**: Seluruh aplikasi mobile banking (BCA, Mandiri Livin, BRImo, BNI) dan dompet digital (GoPay, OVO, ShopeePay, DANA, LinkAja).\n"
                f"   - **Kartu Uang Elektronik (Tapping)**: BCA Flazz, Mandiri e-Money, BNI TapCash, dan BRI Brizzi.\n"
                f"   - **Penukaran Botol Plastik**: Tukarkan sampah botol plastik di halte drop-point (3 botol besar 1.5L atau 5 botol sedang 600ml = 1 tiket gratis via aplikasi Gobis Suroboyo Bus)."
            ),
            function_called=func_name,
            function_args=args
        )

    # Default fallback
    return AIData(
        action="default_narrative",
        target_station=None,
        text_response=(
            "Halo! Saya Asisten Spasial TransitERA. Anda dapat menanyakan: "
            "kesiapan TOD di 15 simpul transit Surabaya, rute intermoda antarmoda (termasuk ke Tunjungan Plaza atau GBT), "
            "daftar feeder WiraWiri & Suroboyo Bus per stasiun, tarif & cara bayar transum, "
            "estimasi kenaikan nilai tanah (%ΔNJOP), atau simulasi skenario rute feeder."
        )
    )
