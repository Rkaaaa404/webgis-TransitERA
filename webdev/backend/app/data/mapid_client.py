import os
import logging
import requests

logger = logging.getLogger(__name__)

MAPID_API_KEY = os.getenv("MAPID_API_KEY", "")
# GEO MAPID Competition endpoints sesuai Notulensi TM2 (Mas Egi & Mas Abil)
ENDPOINT_ACTIVITIES = "https://server.mapid.io/web/competition/activities"
ENDPOINT_MISSION = "https://server.mapid.io/web/competition/mission"


from app.core.config import settings

def _get_nearest_station(lat: float, lon: float) -> dict:
    stations = [
        {"id": "gubeng", "name": "Stasiun Surabaya Gubeng", "lat": -7.2654, "lon": 112.7521},
        {"id": "pasar_turi", "name": "Stasiun Pasar Turi", "lat": -7.2478, "lon": 112.7306},
        {"id": "wonokromo", "name": "Stasiun Wonokromo", "lat": -7.3014, "lon": 112.7383},
        {"id": "semut", "name": "Stasiun Surabaya Kota (Semut)", "lat": -7.2372, "lon": 112.7431},
        {"id": "tandes", "name": "Stasiun Tandes", "lat": -7.2590, "lon": 112.6870},
        {"id": "waru", "name": "Stasiun Waru", "lat": -7.3547, "lon": 112.7297},
    ]
    best_st = stations[0]
    min_dist_sq = 999.0
    for st in stations:
        d = (lat - st["lat"]) ** 2 + (lon - st["lon"]) ** 2
        if d < min_dist_sq:
            min_dist_sq = d
            best_st = st
    return best_st


def fetch_survey_geojson(polygon_coords: list, hashtag: str = "PakSibukGa", survey_type: str = "activity") -> dict:
    """
    Mengambil data survei kompetisi dari GEO MAPID REST API sesuai spesifikasi Notulensi TM2.
    - Endpoint Activity: POST https://server.mapid.io/web/competition/activities
    - Header: X-API-KEY dan Content-Type: application/json
    - Body: feature (GeoJSON Polygon) + hashtag filter
    Jika API offline atau key belum aktif, menggunakan 100 titik Survey Activities primer.
    """
    api_key = settings.MAPID_API_KEY or os.getenv("MAPID_API_KEY", "")
    if not api_key:
        logger.info("MAPID_API_KEY belum diset — menggunakan 100 titik Survey Activities lokal.")
        return {"type": "FeatureCollection", "features": _generate_survey_activities_data()}

    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": api_key,
    }

    # Format resmi GEO MAPID: body harus memiliki key 'feature' berupa GeoJSON Polygon
    payload = {
        "feature": {
            "type": "Polygon",
            "coordinates": polygon_coords,
        },
        "hashtag": [hashtag] if hashtag else ["PakSibukGa"],
    }

    try:
        logger.info(f"Mengontak GEO MAPID API ({ENDPOINT_ACTIVITIES}) dengan hashtag={hashtag!r}...")
        resp = requests.post(ENDPOINT_ACTIVITIES, json=payload, headers=headers, timeout=20)

        if resp.status_code == 200:
            data = resp.json()
            # MAPID structure: {"success": true, "data": {"activities": [...]}}
            activities = data.get("data", {}).get("activities", [])
            if not activities:
                activities = data.get("features", [])

            if activities:
                logger.info(f"Berhasil menarik {len(activities)} titik survei live dari GEO MAPID API!")
                geojson_features = []
                for item in activities:
                    geom = item.get("geometry")
                    if not geom or geom.get("type") != "Point":
                        continue
                    coords = geom.get("coordinates", [])
                    if len(coords) < 2:
                        continue
                    lon, lat = coords[0], coords[1]
                    nearest = _get_nearest_station(lat, lon)
                    
                    media_url = ""
                    medias = item.get("medias", [])
                    if medias and isinstance(medias, list) and len(medias) > 0:
                        first_m = medias[0]
                        media_url = first_m if isinstance(first_m, str) else first_m.get("url", "")

                    geojson_features.append({
                        "type": "Feature",
                        "id": str(item.get("_id", f"mapid-{len(geojson_features)}")),
                        "geometry": geom,
                        "properties": {
                            "id": str(item.get("_id", "")),
                            "name": item.get("title", "Survei #PakSibukGa"),
                            "title": item.get("title", "Survei #PakSibukGa"),
                            "description": item.get("description", ""),
                            "survey_type": "activity",
                            "mission_subtype": None,
                            "hashtag": hashtag,
                            "category": "Pedestrian & Walkability",
                            "condition": "Sedang",
                            "station_cluster": nearest["id"],
                            "station_name": nearest["name"],
                            "photo_url": media_url,
                            "images": [media_url] if media_url else [],
                            "user": item.get("user_name", "Surveyor"),
                            "user_name": item.get("user_name", "Surveyor"),
                            "timestamp": item.get("created_at", "2026-09-02 10:00 WIB"),
                            "surveyed_at": item.get("created_at", "2026-09-02T10:00:00Z"),
                        }
                    })

                return {"type": "FeatureCollection", "features": geojson_features}
        else:
            logger.warning(
                f"GEO MAPID API merespons status {resp.status_code} ({resp.text[:100]}). "
                f"Beralih ke data 100 titik survei activities internal."
            )
    except requests.exceptions.RequestException as e:
        logger.warning(f"Gagal menghubungi server MAPID: {e}. Menggunakan data survei activities.")

    return {"type": "FeatureCollection", "features": _generate_survey_activities_data()}


def _generate_survey_activities_data() -> list:
    """
    Loads the 60 real survey activity points exported from GEO MAPID API (#PakSibukGa).
    These are GPS-verified field observations by 5 surveyors:
    zulfanfkh (15), rayka (15), knownasrayy05 (13), hanaamrp (10), mirzawibi (7).
    Falls back to empty list if the cached GeoJSON is missing.
    """
    import json
    geojson_path = os.path.join(os.path.dirname(__file__), "spatial", "sample_activity_mapid.geojson")
    try:
        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        features = data.get("features", [])
        logger.info(f"Loaded {len(features)} real survey activities from cached GeoJSON.")
        return features
    except FileNotFoundError:
        logger.warning(f"Cached survey GeoJSON not found at {geojson_path}. Returning empty list.")
        return []
    except Exception as e:
        logger.warning(f"Error loading cached survey GeoJSON: {e}. Returning empty list.")
        return []

