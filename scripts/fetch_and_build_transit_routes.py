#!/usr/bin/env python3
"""
TransitERA — Surabaya Public Transit Routes Ingestion Pipeline
Mengunduh dan menstandardisasi 16 rute trayek riil Kota Surabaya (Suroboyo Bus & Feeder WiraWiri)
dari repositori terbuka DoubleA4/busmapsby menjadi GeoJSON WGS84 lokal mandiri.
"""

import os
import json
import math
import logging
import httpx

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

REPO_RAW_URL = "https://raw.githubusercontent.com/DoubleA4/busmapsby/main/routedata.json"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "webdev", "backend", "app", "data", "spatial")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "trayek_surabaya.geojson")

# Koordinat 15 stasiun transit Surabaya Raya untuk kalkulasi relasi antarmoda
STATIONS_COORDS = {
    "gubeng": (-7.2652, 112.7522, "Stasiun Surabaya Gubeng"),
    "pasar_turi": (-7.24817, 112.7312, "Stasiun Pasar Turi"),
    "wonokromo": (-7.30206, 112.7394, "Stasiun Wonokromo"),
    "semut": (-7.24298, 112.742, "Stasiun Surabaya Kota (Semut)"),
    "waru": (-7.3547, 112.7297, "Stasiun Waru (Gerbang Selatan)"),
    "tandes": (-7.25897, 112.687, "Stasiun Tandes"),
    "kandangan": (-7.25079, 112.6572, "Stasiun Kandangan"),
    "benowo": (-7.23407, 112.6152, "Stasiun Benowo"),
    "ngagel": (-7.28778, 112.7482, "Stasiun Ngagel"),
    "margorejo": (-7.3147, 112.7344, "Stasiun Margorejo"),
    "jemursari": (-7.32928, 112.7314, "Stasiun Jemursari"),
    "kertomenanggal": (-7.34058, 112.7294, "Stasiun Kertomenanggal"),
    "kalimas": (-7.21991, 112.735, "Stasiun Kalimas"),
    "benteng": (-7.22119, 112.744, "Stasiun Benteng"),
    "sidotopo": (-7.23529, 112.7574, "Stasiun Sidotopo"),
}


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def main():
    logger.info("Mengunduh data rute dari repositori busmapsby...")
    resp = httpx.get(REPO_RAW_URL, timeout=20.0)
    resp.raise_for_status()
    raw_routes = resp.json()

    features = []

    for r_id, r in raw_routes.items():
        raw_pts = r.get("datarute", [])
        if not raw_pts or len(raw_pts) < 2:
            continue

        coords = [[float(pt["lon"]), float(pt["lat"])] for pt in raw_pts]
        name = r.get("name", r_id.upper())
        title = r.get("title", "")
        is_feeder = bool(r.get("feeder", False))
        color = r.get("color", "#10B981" if is_feeder else "#EF4444")

        # Operator / kategori armada
        if is_feeder:
            category = "feeder_wirawiri"
            prefix = f"Feeder FD{name.zfill(2) if name.isdigit() else name}"
            operator = "WiraWiri Suroboyo"
        elif "tmk" in r_id:
            category = "trans_semanggi"
            prefix = f"Trans Semanggi {name}"
            operator = "Trans Semanggi Suroboyo (Teman Bus)"
        elif r_id == "sbrt":
            category = "bus_tumpuk"
            prefix = "Bus Tumpuk (SBT)"
            operator = "DISHUB Kota Surabaya"
        else:
            category = "suroboyo_bus"
            prefix = f"Suroboyo Bus {name}"
            operator = "DISHUB Kota Surabaya"

        display_name = f"{prefix}: {title}"

        # Hitung stasiun KA yang terhubung (radius <= 600m dari rute)
        connected_stations = []
        for s_id, (slat, slon, s_display) in STATIONS_COORDS.items():
            min_dist = min(haversine_m(slat, slon, float(pt["lat"]), float(pt["lon"])) for pt in raw_pts)
            if min_dist <= 600.0:
                connected_stations.append({
                    "station_id": s_id,
                    "station_name": s_display,
                    "distance_m": round(min_dist, 1)
                })

        features.append({
            "type": "Feature",
            "id": r_id,
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "route_id": r_id,
                "code": r.get("code", name),
                "name": name,
                "title": title,
                "display_name": display_name,
                "operator": operator,
                "category": category,
                "is_feeder": is_feeder,
                "color": color,
                "hours": r.get("hours", "05:30 - 21:00 WIB"),
                "fare": "Rp 5.000 (Integrasi 2 Jam)" if not is_feeder else "Rp 5.000 (Integrasi Bus/Feeder)",
                "point_count": len(coords),
                "connected_stations": connected_stations,
                "connected_station_ids": [s["station_id"] for s in connected_stations]
            }
        })

    geojson_result = {
        "type": "FeatureCollection",
        "metadata": {
            "source": "Dishub Surabaya / Komunitas Transportasi Terbuka",
            "generated_by": "TransitERA Ingestion Engine",
            "total_routes": len(features),
            "updated_at": "2026-09-13T12:20:00+07:00"
        },
        "features": features
    }

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson_result, f, indent=2, ensure_ascii=False)

    logger.info(f"Berhasil menyimpan {len(features)} rute trayek ke {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
