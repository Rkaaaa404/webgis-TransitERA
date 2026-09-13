import os
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

SPATIAL_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "spatial")
TRAYEK_PATH = os.path.join(SPATIAL_DIR, "trayek_surabaya.geojson")

_CACHED_TRAYEK: Optional[Dict[str, Any]] = None

def get_trayek_geojson() -> Dict[str, Any]:
    global _CACHED_TRAYEK
    if _CACHED_TRAYEK is not None:
        return _CACHED_TRAYEK

    if os.path.exists(TRAYEK_PATH):
        try:
            with open(TRAYEK_PATH, "r", encoding="utf-8") as f:
                _CACHED_TRAYEK = json.load(f)
                return _CACHED_TRAYEK
        except Exception as e:
            logger.error(f"Gagal membaca trayek_surabaya.geojson: {e}")

    return {"type": "FeatureCollection", "features": []}


# Template navigasi intermoda kurasi per stasiun (real transit connections)
_INTERMODAL_PLANS: Dict[str, List[Dict[str, Any]]] = {
    "gubeng": [
        {
            "destination": "Grand City Mall & Balai Kota",
            "total_time": "9 min",
            "total_distance_km": 1.4,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd02",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Stasiun Gubeng Barat", "duration": "2 min", "distance": "140m"},
                {"mode": "feeder", "line_code": "FD02", "line_color": "#8c2f31", "desc": "Naik Feeder WiraWiri FD02 arah Balai Kota (3 halte)", "duration": "5 min", "distance": "1.1 km"},
                {"mode": "walk", "desc": "Jalan kaki ke Grand City / Balai Kota", "duration": "2 min", "distance": "160m"}
            ]
        },
        {
            "destination": "RSUD Dr. Soetomo & UNAIR Kampus B",
            "total_time": "11 min",
            "total_distance_km": 1.8,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "tmk2",
            "modes_used": ["walk", "bus"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte RSGM Prof. Moestopo", "duration": "2 min", "distance": "100m"},
                {"mode": "bus", "line_code": "R2", "line_color": "#2f87a0", "desc": "Naik Trans Semanggi R2 arah Kejawan (4 halte)", "duration": "7 min", "distance": "1.5 km"},
                {"mode": "walk", "desc": "Tiba di RSUD Dr. Soetomo Gate Dharmawangsa", "duration": "2 min", "distance": "200m"}
            ]
        },
        {
            "destination": "Tunjungan Plaza / Koridor Tunjungan",
            "total_time": "14 min",
            "total_distance_km": 2.5,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd07",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Gubeng Pojok", "duration": "3 min", "distance": "180m"},
                {"mode": "feeder", "line_code": "FD07", "line_color": "#4165ad", "desc": "Naik Feeder WiraWiri FD07 arah Pasar Turi (5 halte)", "duration": "9 min", "distance": "2.1 km"},
                {"mode": "walk", "desc": "Jalan kaki menyeberang ke Tunjungan Plaza", "duration": "2 min", "distance": "150m"}
            ]
        },
        {
            "destination": "Terminal Purabaya (Bungurasih)",
            "total_time": "22 min",
            "total_distance_km": 12.0,
            "fare": "Rp 4.000 (KRL Commuter)",
            "route_id": "sbr4",
            "modes_used": ["walk", "train"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki menuju Peron 1 Stasiun Gubeng", "duration": "2 min", "distance": "80m"},
                {"mode": "train", "line_code": "KRL", "line_color": "#0ea5e9", "desc": "Naik Commuter Line Supas ke Stasiun Waru", "duration": "16 min", "distance": "11.5 km"},
                {"mode": "walk", "desc": "Jalan kaki via jembatan penghubung ke Terminal Purabaya", "duration": "4 min", "distance": "280m"}
            ]
        }
    ],
    "pasar_turi": [
        {
            "destination": "Tugu Pahlawan & Kawasan Bersejarah",
            "total_time": "7 min",
            "total_distance_km": 1.1,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd07",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Gate St. Pasar Turi", "duration": "1 min", "distance": "50m"},
                {"mode": "feeder", "line_code": "FD07", "line_color": "#4165ad", "desc": "Naik Feeder WiraWiri FD07 arah Bratang (2 halte)", "duration": "4 min", "distance": "900m"},
                {"mode": "walk", "desc": "Jalan kaki ke Monumen Tugu Pahlawan", "duration": "2 min", "distance": "150m"}
            ]
        },
        {
            "destination": "Pusat Grosir Surabaya (PGS) & Pasar Turi Baru",
            "total_time": "4 min",
            "total_distance_km": 0.3,
            "fare": "Gratis (Pedestrian)",
            "route_id": "fd07",
            "modes_used": ["walk"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki melalui jalur pedestrian berkanopi Jalan Dupak", "duration": "4 min", "distance": "280m"}
            ]
        },
        {
            "destination": "Balai Kota Surabaya",
            "total_time": "15 min",
            "total_distance_km": 3.2,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd07",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Gate St. Pasar Turi", "duration": "1 min", "distance": "50m"},
                {"mode": "feeder", "line_code": "FD07", "line_color": "#4165ad", "desc": "Naik Feeder WiraWiri FD07 arah Bratang (7 halte)", "duration": "12 min", "distance": "2.9 km"},
                {"mode": "walk", "desc": "Jalan kaki ke Kompleks Balai Kota Taman Surya", "duration": "2 min", "distance": "180m"}
            ]
        },
        {
            "destination": "Terminal Bratang",
            "total_time": "28 min",
            "total_distance_km": 7.8,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd07",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Gate St. Pasar Turi", "duration": "1 min", "distance": "50m"},
                {"mode": "feeder", "line_code": "FD07", "line_color": "#4165ad", "desc": "Naik Feeder WiraWiri FD07 rute langsung Pasar Turi - Bratang", "duration": "25 min", "distance": "7.6 km"},
                {"mode": "walk", "desc": "Tiba di Shelter Utama Terminal Bratang", "duration": "2 min", "distance": "100m"}
            ]
        }
    ],
    "wonokromo": [
        {
            "destination": "Kebun Binatang Surabaya (KBS)",
            "total_time": "5 min",
            "total_distance_km": 0.4,
            "fare": "Gratis (Pedestrian)",
            "route_id": "sbr1",
            "modes_used": ["walk"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki dari pintu utara stasiun menyeberang Jembatan Sawunggaling", "duration": "5 min", "distance": "350m"}
            ]
        },
        {
            "destination": "Terminal Intermoda Joyoboyo (TIJ)",
            "total_time": "3 min",
            "total_distance_km": 0.2,
            "fare": "Gratis (Pedestrian)",
            "route_id": "fd03",
            "modes_used": ["walk"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki melintasi skywalk intermoda menuju concourse bus TIJ", "duration": "3 min", "distance": "180m"}
            ]
        },
        {
            "destination": "Kawasan Industri SIER (Rungkut)",
            "total_time": "19 min",
            "total_distance_km": 5.4,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd04",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke TIJ Jalur 2", "duration": "3 min", "distance": "180m"},
                {"mode": "feeder", "line_code": "FD04", "line_color": "#8f6768", "desc": "Naik Feeder WiraWiri FD04 arah SIER (11 halte)", "duration": "14 min", "distance": "5.0 km"},
                {"mode": "walk", "desc": "Tiba di Kawasan Industri & Perkantoran SIER", "duration": "2 min", "distance": "150m"}
            ]
        },
        {
            "destination": "Alun-Alun Sidoarjo",
            "total_time": "26 min",
            "total_distance_km": 16.5,
            "fare": "Rp 4.000 (KRL Commuter)",
            "route_id": "sbr1",
            "modes_used": ["walk", "train"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Peron 2 Stasiun Wonokromo", "duration": "2 min", "distance": "60m"},
                {"mode": "train", "line_code": "KRL", "line_color": "#0ea5e9", "desc": "Naik KRL Commuter Line Supas ke Stasiun Sidoarjo", "duration": "20 min", "distance": "16.0 km"},
                {"mode": "walk", "desc": "Jalan kaki ke Alun-Alun Sidoarjo", "duration": "4 min", "distance": "320m"}
            ]
        }
    ],
    "semut": [
        {
            "destination": "Kawasan Kota Lama (Jembatan Merah)",
            "total_time": "6 min",
            "total_distance_km": 0.9,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd04",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Stasiun Surabaya Kota", "duration": "1 min", "distance": "60m"},
                {"mode": "feeder", "line_code": "FD04", "line_color": "#8f6768", "desc": "Naik Feeder WiraWiri FD04 arah Kota Lama (2 halte)", "duration": "3 min", "distance": "750m"},
                {"mode": "walk", "desc": "Tiba di Zona Eropa Kota Lama / Jembatan Merah", "duration": "2 min", "distance": "100m"}
            ]
        },
        {
            "destination": "Pasar Atom Mall & Kuliner",
            "total_time": "5 min",
            "total_distance_km": 0.4,
            "fare": "Gratis (Pedestrian)",
            "route_id": "fd10",
            "modes_used": ["walk"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki via Jalan Stasiun Kota ke Lobby Pasar Atom", "duration": "5 min", "distance": "350m"}
            ]
        },
        {
            "destination": "Pelabuhan Tanjung Perak",
            "total_time": "18 min",
            "total_distance_km": 5.2,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "sbr1",
            "modes_used": ["walk", "bus"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Halte Jembatan Merah", "duration": "4 min", "distance": "300m"},
                {"mode": "bus", "line_code": "R1", "line_color": "#d23c41", "desc": "Naik Suroboyo Bus R1 arah Perak (6 halte)", "duration": "12 min", "distance": "4.7 km"},
                {"mode": "walk", "desc": "Tiba di Terminal Penumpang Gapura Surya Nusantara", "duration": "2 min", "distance": "150m"}
            ]
        }
    ],
    "waru": [
        {
            "destination": "Terminal Purabaya (Bungurasih)",
            "total_time": "4 min",
            "total_distance_km": 0.3,
            "fare": "Gratis (Pedestrian)",
            "route_id": "sbr1",
            "modes_used": ["walk"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki melintasi jembatan penyeberangan terminal", "duration": "4 min", "distance": "280m"}
            ]
        },
        {
            "destination": "Kampus ITS Sukolilo",
            "total_time": "36 min",
            "total_distance_km": 14.2,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "fd12",
            "modes_used": ["walk", "feeder"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Shelter Feeder Purabaya", "duration": "2 min", "distance": "110m"},
                {"mode": "feeder", "line_code": "FD12", "line_color": "#664c9c", "desc": "Naik Feeder WiraWiri FD12 langsung via MERR (18 halte)", "duration": "32 min", "distance": "13.8 km"},
                {"mode": "walk", "desc": "Tiba di Bundaran ITS / Gedung Rektorat", "duration": "2 min", "distance": "180m"}
            ]
        },
        {
            "destination": "Pusat Kota (Koridor Tunjungan)",
            "total_time": "28 min",
            "total_distance_km": 11.5,
            "fare": "Rp 5.000 (Integrasi)",
            "route_id": "sbr1",
            "modes_used": ["walk", "bus"],
            "steps": [
                {"mode": "walk", "desc": "Jalan kaki ke Shelter Suroboyo Bus Terminal Purabaya", "duration": "2 min", "distance": "90m"},
                {"mode": "bus", "line_code": "R1", "line_color": "#d23c41", "desc": "Naik Suroboyo Bus R1 via Darmo (14 halte)", "duration": "24 min", "distance": "11.2 km"},
                {"mode": "walk", "desc": "Turun di Halte Tunjungan", "duration": "2 min", "distance": "120m"}
            ]
        }
    ]
}


def get_intermodal_plans(station_id: str) -> List[Dict[str, Any]]:
    """Mengembalikan opsi perjalanan intermoda riil untuk stasiun yang diminta."""
    st_id = (station_id or "gubeng").lower().strip()
    if st_id in _INTERMODAL_PLANS:
        return _INTERMODAL_PLANS[st_id]

    # Dynamic fallback untuk stasiun lainnya berbasis rel ke hub utama
    return [
        {
            "destination": "Stasiun Surabaya Gubeng (Hub Pusat)",
            "total_time": "18 min",
            "total_distance_km": 8.5,
            "fare": "Rp 4.000 (KRL Commuter)",
            "route_id": "sbr1",
            "modes_used": ["walk", "train"],
            "steps": [
                {"mode": "walk", "desc": f"Jalan kaki ke Peron Stasiun {st_id.title()}", "duration": "2 min", "distance": "60m"},
                {"mode": "train", "line_code": "KRL", "line_color": "#0ea5e9", "desc": "Naik Commuter Line KRL menuju Stasiun Gubeng", "duration": "14 min", "distance": "8.2 km"},
                {"mode": "walk", "desc": "Tiba di Concourse Utama Gubeng", "duration": "2 min", "distance": "100m"}
            ]
        },
        {
            "destination": "Pusat Kota & Tunjungan Plaza",
            "total_time": "28 min",
            "total_distance_km": 10.2,
            "fare": "Rp 9.000 (Kereta + Feeder)",
            "route_id": "fd07",
            "modes_used": ["train", "feeder"],
            "steps": [
                {"mode": "train", "line_code": "KRL", "line_color": "#0ea5e9", "desc": "Naik Commuter Line menuju Stasiun Pasar Turi", "duration": "16 min", "distance": "7.5 km"},
                {"mode": "feeder", "line_code": "FD07", "line_color": "#4165ad", "desc": "Transfer Feeder WiraWiri FD07 ke Tunjungan", "duration": "10 min", "distance": "2.4 km"},
                {"mode": "walk", "desc": "Tiba di Kawasan Perbelanjaan Tunjungan", "duration": "2 min", "distance": "150m"}
            ]
        }
    ]
