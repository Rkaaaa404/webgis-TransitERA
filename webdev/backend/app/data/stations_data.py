import math
from typing import Dict, Any, List

from app.spatial.h3_grid import generate_station_h3_cluster
from app.spatial.real_data_pipeline import compute_all_station_analytics, get_all_real_h3_features

_STATIC_FALLBACK_STATIONS_DATA: Dict[str, Dict[str, Any]] = {
    "gubeng": {
        "id": "gubeng",
        "name": "Stasiun Surabaya Gubeng",
        "latitude": -7.2654,
        "longitude": 112.7521,
        "is_tier_1": True,
        "tod_readiness_score": 84.5,
        "scores": {
            "density": 88.0,
            "diversity": 85.5,
            "design": 78.0,
            "destination_accessibility": 90.0,
            "distance_to_transit": 81.5
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Commercial Transit Hub",
        "weakest_dimension": "Design",
        "strongest_dimension": "Destination Accessibility",
        "status": "Sangat Siap (Tier 1)",
        "njop_base_m2": 7000000,
        "njop_premium": {
            "avg_njop_premium_pct": 14.8,
            "ci_lower_pct": 11.2,
            "ci_upper_pct": 18.4,
            "affected_h3_count": 37,
            "r_squared": 0.78,
            "direct_effect_pct": 10.2,
            "spillover_effect_pct": 4.6
        },
        "policy_recommendations": [
            "Perluasan jalur pedestrian berkanopi di koridor timur menuju Jalan Dharmahusada.",
            "Penambahan integrasi halte feeder WiraWiri rute FD07 langsung di lobby stasiun.",
            "Penerapan insentif lantai bangunan (FAR bonus) untuk hunian vertikal terjangkau dalam radius 400m."
        ]
    },
    "pasar_turi": {
        "id": "pasar_turi",
        "name": "Stasiun Pasar Turi",
        "latitude": -7.2478,
        "longitude": 112.7306,
        "is_tier_1": True,
        "tod_readiness_score": 79.2,
        "scores": {
            "density": 82.0,
            "diversity": 86.0,
            "design": 65.5,
            "destination_accessibility": 83.0,
            "distance_to_transit": 79.5
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Commercial Transit Hub",
        "weakest_dimension": "Design",
        "strongest_dimension": "Diversity",
        "status": "Siap (Tier 2)",
        "njop_base_m2": 18300000,
        "njop_premium": {
            "avg_njop_premium_pct": 12.3,
            "ci_lower_pct": 9.1,
            "ci_upper_pct": 15.5,
            "affected_h3_count": 37,
            "r_squared": 0.74,
            "direct_effect_pct": 8.5,
            "spillover_effect_pct": 3.8
        },
        "policy_recommendations": [
            "Penataan relokasi kantong parkir liar dan PKL yang meluber di Jalan Semarang.",
            "Peningkatan kualitas trotoar dengan tactile paving standar disabilitas menuju Pasar Turi Baru.",
            "Penyediaan integrasi antarmoda terpadu Suroboyo Bus Koridor 3."
        ]
    },
    "semut": {
        "id": "semut",
        "name": "Stasiun Surabaya Kota (Semut)",
        "latitude": -7.2372,
        "longitude": 112.7431,
        "is_tier_1": False,
        "tod_readiness_score": 71.0,
        "scores": {
            "density": 74.0,
            "diversity": 78.0,
            "design": 60.0,
            "destination_accessibility": 75.0,
            "distance_to_transit": 68.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Mixed-Use Heritage Transit",
        "weakest_dimension": "Design",
        "strongest_dimension": "Diversity",
        "status": "Cukup Siap (Tier 2)",
        "njop_base_m2": 17400000,
        "njop_premium": {
            "avg_njop_premium_pct": 9.4,
            "ci_lower_pct": 6.8,
            "ci_upper_pct": 12.0,
            "affected_h3_count": 37,
            "r_squared": 0.71,
            "direct_effect_pct": 6.7,
            "spillover_effect_pct": 2.7
        },
        "policy_recommendations": [
            "Revitalisasi koridor pedestrian cagar budaya di sekitar Stasiun Semut dan Jembatan Merah.",
            "Perbaikan drainase mikro untuk mitigasi genangan air di Jalan Stasiun Kota.",
            "Penguatan rute feeder penghubung kawasan heritage Kota Tua Surabaya."
        ]
    },
    "wonokromo": {
        "id": "wonokromo",
        "name": "Stasiun Wonokromo",
        "latitude": -7.3014,
        "longitude": 112.7383,
        "is_tier_1": True,
        "tod_readiness_score": 76.8,
        "scores": {
            "density": 85.0,
            "diversity": 79.0,
            "design": 62.0,
            "destination_accessibility": 78.0,
            "distance_to_transit": 84.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Dense Commuter Mixed-Use",
        "weakest_dimension": "Design",
        "strongest_dimension": "Density",
        "status": "Siap (Tier 2)",
        "njop_base_m2": 11200000,
        "njop_premium": {
            "avg_njop_premium_pct": 11.6,
            "ci_lower_pct": 8.5,
            "ci_upper_pct": 14.7,
            "affected_h3_count": 37,
            "r_squared": 0.75,
            "direct_effect_pct": 8.0,
            "spillover_effect_pct": 3.6
        },
        "policy_recommendations": [
            "Penyediaan JPO terintegrasi langsung antara lantai 2 stasiun dengan DTC Mall.",
            "Penataan ulang pangkalan ojek online di bawah flyover Mayangkara agar tidak memacetkan lajur bus.",
            "Pembangunan shelter transit antarmoda dengan Terminal Joyoboyo."
        ]
    },
    "waru": {
        "id": "waru",
        "name": "Stasiun Waru (Gerbang Selatan)",
        "latitude": -7.3547,
        "longitude": 112.7297,
        "is_tier_1": False,
        "tod_readiness_score": 68.2,
        "scores": {
            "density": 70.0,
            "diversity": 65.0,
            "design": 54.0,
            "destination_accessibility": 68.0,
            "distance_to_transit": 84.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Suburban Feeder Node",
        "weakest_dimension": "Design",
        "strongest_dimension": "Distance to Transit",
        "status": "Cukup Siap (Tier 2)",
        "njop_base_m2": 6500000,
        "njop_premium": {
            "avg_njop_premium_pct": 8.2,
            "ci_lower_pct": 5.7,
            "ci_upper_pct": 10.7,
            "affected_h3_count": 37,
            "r_squared": 0.69,
            "direct_effect_pct": 5.9,
            "spillover_effect_pct": 2.3
        },
        "policy_recommendations": [
            "Pembangunan skywalk pedestrian terintegrasi langsung antara Stasiun Waru dengan Terminal Purabaya sesuai Perda RTRW Surabaya No. 8/2024.",
            "Ekspansi koridor feeder WiraWiri rute selatan aglomerasi Sidoarjo-Surabaya.",
            "Pencegahan titik genangan banjir berkala di persimpangan Bundaran Waru."
        ]
    },
    "terminal_joyoboyo": {
        "id": "terminal_joyoboyo",
        "name": "Terminal Intermoda Joyoboyo (TIJ)",
        "latitude": -7.2995,
        "longitude": 112.7368,
        "is_tier_1": True,
        "tod_readiness_score": 82.4,
        "scores": {
            "density": 86.0,
            "diversity": 84.0,
            "design": 75.0,
            "destination_accessibility": 88.5,
            "distance_to_transit": 92.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Commercial Transit Hub",
        "weakest_dimension": "Design",
        "strongest_dimension": "Distance to Transit",
        "status": "Sangat Siap (Tier 1)",
        "njop_base_m2": 11500000,
        "njop_premium": {
            "avg_njop_premium_pct": 13.8,
            "ci_lower_pct": 10.4,
            "ci_upper_pct": 17.2,
            "affected_h3_count": 37,
            "r_squared": 0.77,
            "direct_effect_pct": 9.6,
            "spillover_effect_pct": 4.2
        },
        "policy_recommendations": [
            "Optimalisasi integrasi intermoda antara terminal bus TIJ dengan Stasiun Wonokromo via Skybridge Sawunggaling sesuai Permen ATR/BPN No. 16/2017.",
            "Penyediaan fasilitas park-and-ride berinsentif untuk menekan penggunaan kendaraan pribadi ke pusat kota.",
            "Pengembangan koridor UMKM kuliner Menu Go di lantai concourse TIJ."
        ]
    },
    "terminal_purabaya": {
        "id": "terminal_purabaya",
        "name": "Terminal Purabaya (Bungurasih)",
        "latitude": -7.3526,
        "longitude": 112.7235,
        "is_tier_1": True,
        "tod_readiness_score": 79.8,
        "scores": {
            "density": 83.0,
            "diversity": 82.5,
            "design": 68.0,
            "destination_accessibility": 85.0,
            "distance_to_transit": 94.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Commercial Transit Hub",
        "weakest_dimension": "Design",
        "strongest_dimension": "Distance to Transit",
        "status": "Siap (Tier 1)",
        "njop_base_m2": 7200000,
        "njop_premium": {
            "avg_njop_premium_pct": 11.9,
            "ci_lower_pct": 8.8,
            "ci_upper_pct": 15.0,
            "affected_h3_count": 37,
            "r_squared": 0.73,
            "direct_effect_pct": 8.2,
            "spillover_effect_pct": 3.7
        },
        "policy_recommendations": [
            "Peningkatan kanopi pelindung pejalan kaki dan sterilisasi jalur drop-off bus antarkota.",
            "Integrasi tiket terusan elektronik multi-operator (Trans Jatim, Suroboyo Bus, dan KAI Commuter).",
            "Peningkatan penerangan malam hari (NTL) di koridor pedestrian penghubung stasiun-terminal."
        ]
    },
    "terminal_bratang": {
        "id": "terminal_bratang",
        "name": "Terminal Bratang",
        "latitude": -7.2954,
        "longitude": 112.7612,
        "is_tier_1": False,
        "tod_readiness_score": 74.5,
        "scores": {
            "density": 79.0,
            "diversity": 76.0,
            "design": 64.0,
            "destination_accessibility": 78.0,
            "distance_to_transit": 86.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Mixed-Use Residential Area",
        "weakest_dimension": "Design",
        "strongest_dimension": "Distance to Transit",
        "status": "Siap (Tier 2)",
        "njop_base_m2": 8900000,
        "njop_premium": {
            "avg_njop_premium_pct": 10.1,
            "ci_lower_pct": 7.4,
            "ci_upper_pct": 12.8,
            "affected_h3_count": 37,
            "r_squared": 0.71,
            "direct_effect_pct": 7.1,
            "spillover_effect_pct": 3.0
        },
        "policy_recommendations": [
            "Penataan shelter transit Feeder WiraWiri rute FD07 dan FD11.",
            "Integrasi area kuliner malam Pasar Burung Bratang dengan konsep pedestrian plaza ramah lingkungan.",
            "Perbaikan resapan air dan pemeliharaan pohon peneduh di sekeliling terminal."
        ]
    },
    "ngagel": {
        "id": "ngagel",
        "name": "Stasiun Ngagel",
        "latitude": -7.2878,
        "longitude": 112.7482,
        "is_tier_1": False,
        "tod_readiness_score": 75.8,
        "scores": {
            "density": 81.0,
            "diversity": 78.0,
            "design": 63.0,
            "destination_accessibility": 79.0,
            "distance_to_transit": 84.0
        },
        "benchmark_scores": {
            "density": 77.0,
            "diversity": 76.5,
            "design": 62.5,
            "destination_accessibility": 79.5,
            "distance_to_transit": 78.0
        },
        "typology": "Dense Commuter Mixed-Use",
        "weakest_dimension": "Design",
        "strongest_dimension": "Density",
        "status": "Siap (Tier 2)",
        "njop_base_m2": 9800000,
        "njop_premium": {
            "avg_njop_premium_pct": 10.7,
            "ci_lower_pct": 7.8,
            "ci_upper_pct": 13.6,
            "affected_h3_count": 37,
            "r_squared": 0.72,
            "direct_effect_pct": 7.5,
            "spillover_effect_pct": 3.2
        },
        "policy_recommendations": [
            "Pengaktifan kembali integrasi halte feeder Ngagel Madya dengan pintu masuk stasiun.",
            "Penguatan koridor transit pengisi antara Stasiun Surabaya Gubeng dan Wonokromo.",
            "Penyediaan jalur sepeda dan bike-sharing hub di koridor Jalan Ngagel Jaya."
        ]
    }
}

try:
    STATIONS_DATA: Dict[str, Dict[str, Any]] = compute_all_station_analytics()
except Exception as e:
    STATIONS_DATA = _STATIC_FALLBACK_STATIONS_DATA

# Mapping dari dimension name ke key dalam scores dict
_DIMENSION_KEY_MAP: Dict[str, str] = {
    "Density": "density",
    "Diversity": "diversity",
    "Design": "design",
    "Destination Accessibility": "destination_accessibility",
    "Distance to Transit": "distance_to_transit",
}


def get_weakest_dimension_score(station: Dict[str, Any]) -> float:
    """Mengembalikan skor numerik dari dimensi terlemah stasiun secara dinamis."""
    weakest = station.get("weakest_dimension", "Design")
    key = _DIMENSION_KEY_MAP.get(weakest, "design")
    return station["scores"].get(key, 0.0)


def get_all_h3_features() -> Dict[str, Any]:
    """Pre-generate GeoJSON FeatureCollection seluruh sel H3 dari semua stasiun."""
    try:
        return get_all_real_h3_features()
    except Exception:
        features = []
        for s_id, s_data in STATIONS_DATA.items():
            cluster_features = generate_station_h3_cluster(
                station_id=s_id,
                station_name=s_data["name"],
                center_lon=s_data["longitude"],
                center_lat=s_data["latitude"],
                base_tod_score=s_data["tod_readiness_score"],
                base_njop_premium=s_data["njop_premium"]["avg_njop_premium_pct"],
                typology=s_data["typology"]
            )
            features.extend(cluster_features)
        return {"type": "FeatureCollection", "features": features}


def get_all_survey_features() -> Dict[str, Any]:
    """Menghasilkan mock survey points (Activity & Mission) per stasiun untuk fallback lokal."""
    sample_categories = [
        {"cat": "Pedestrian & Walkability", "type": "activity", "sub": None, "icon": "walk",
         "desc": "Trotoar lebar dengan tactile paving namun terdapat lubang dekat halte."},
        {"cat": "Transit Integration", "type": "activity", "sub": None, "icon": "bus",
         "desc": "Titik drop-off ojek online teratur dekat pintu utara stasiun."},
        {"cat": "Disamenity & Obstacle", "type": "activity", "sub": None, "icon": "alert",
         "desc": "PKL memakan 60% badan trotoar pejalan kaki jam sibuk sore."},
        {"cat": "User Dynamics", "type": "activity", "sub": None, "icon": "users",
         "desc": "Antrean penumpang feeder WiraWiri padat pukul 07.15 WIB."},
        {"cat": "Menu Go", "type": "mission", "sub": "menu_go", "icon": "coffee",
         "desc": "Kedai Kopi Komuter - Menu Rp 18.000 - Rp 32.000. Kondisi ramai."},
        {"cat": "Struk Go", "type": "mission", "sub": "struk_go", "icon": "receipt",
         "desc": "Minimarket Stasiun - Rata-rata transaksi Rp 38.500 per pelanggan."},
        {"cat": "Properti Go", "type": "mission", "sub": "properti_go", "icon": "home",
         "desc": "Ruko 2 Lantai Disewakan - Rp 65 Juta/tahun radius 300m dari stasiun."}
    ]

    features = []
    point_id = 1
    for s_id, s_data in STATIONS_DATA.items():
        base_lon = s_data["longitude"]
        base_lat = s_data["latitude"]

        for i in range(12):
            cat_info = sample_categories[i % len(sample_categories)]
            angle = (i * 30) * math.pi / 180.0
            radius_deg = 0.002 + (i % 4) * 0.0015
            pt_lon = round(base_lon + radius_deg * 1.2 * math.cos(angle), 6)
            pt_lat = round(base_lat + radius_deg * math.sin(angle), 6)

            features.append({
                "type": "Feature",
                "id": f"survey_{point_id:04d}",
                "properties": {
                    "id": f"survey_{point_id:04d}",
                    "station_cluster": s_id,
                    "station_name": s_data["name"],
                    "category": cat_info["cat"],
                    "survey_type": cat_info["type"],
                    "mission_subtype": cat_info["sub"],
                    "hashtag": "#PakSibukGa",
                    "name": f"{cat_info['cat']} - {s_data['name']} #{point_id}",
                    "description": cat_info["desc"],
                    "condition": "Cukup Baik" if i % 2 == 0 else "Perlu Perbaikan",
                    "spending_amount": 35000 + (i * 4500) if cat_info["sub"] == "struk_go" else None,
                    "menu_price_range": "Rp 15.000 - Rp 35.000" if cat_info["sub"] == "menu_go" else None,
                    "property_price": 65000000 + (i * 10000000) if cat_info["sub"] == "properti_go" else None,
                    "transaction_type": "sewa" if i % 2 == 0 else "jual",
                    "surveyed_at": "2026-08-16T14:30:00+07:00",
                    "photo_url": "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&auto=format&fit=crop&q=60"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [pt_lon, pt_lat]
                }
            })
            point_id += 1

    return {"type": "FeatureCollection", "features": features}
