"""
Clip GISTARU GeoJSON to station catchment areas (~2km radius) and simplify geometry.
Reduces the 150MB full-Surabaya file to a manageable ~2-5MB corridor-only file.
"""
import json
import math
from pathlib import Path

# Station coordinates
STATIONS = [
    {"id": "gubeng",            "lat": -7.2654,  "lon": 112.7521},
    {"id": "pasar_turi",        "lat": -7.2478,  "lon": 112.7306},
    {"id": "semut",             "lat": -7.2372,  "lon": 112.7431},
    {"id": "wonokromo",         "lat": -7.3014,  "lon": 112.7383},
    {"id": "waru",              "lat": -7.3547,  "lon": 112.7297},
    {"id": "terminal_joyoboyo", "lat": -7.2995,  "lon": 112.7368},
    {"id": "ngagel",            "lat": -7.2878,  "lon": 112.7482},
]

RADIUS_DEG = 0.025  # ~2.8km radius in degrees — generous to show context


def dist_sq(lon1, lat1, lon2, lat2):
    return (lon1 - lon2) ** 2 + (lat1 - lat2) ** 2


def bbox_intersects(minlon, minlat, maxlon, maxlat, slon, slat, r):
    """Check if a bounding box intersects with a circle (approximated as square)."""
    closest_lon = max(minlon, min(slon, maxlon))
    closest_lat = max(minlat, min(slat, maxlat))
    return dist_sq(closest_lon, closest_lat, slon, slat) <= r * r


def feature_in_catchment(feat, stations, radius):
    """Check if a GeoJSON feature's bounding box is within any station catchment."""
    geom = feat.get("geometry", {})
    geom_type = geom.get("type", "")
    coords = geom.get("coordinates", [])

    # Get all coordinate points
    all_pts = []
    if geom_type == "Polygon":
        all_pts = coords[0] if coords else []
    elif geom_type == "MultiPolygon":
        for poly in coords:
            if poly:
                all_pts.extend(poly[0])

    if not all_pts:
        return False

    # Compute bounding box
    lons = [p[0] for p in all_pts if len(p) >= 2]
    lats = [p[1] for p in all_pts if len(p) >= 2]
    if not lons:
        return False
    minlon, maxlon = min(lons), max(lons)
    minlat, maxlat = min(lats), max(lats)
    centroid_lon = (minlon + maxlon) / 2
    centroid_lat = (minlat + maxlat) / 2

    for s in stations:
        if dist_sq(centroid_lon, centroid_lat, s["lon"], s["lat"]) <= radius * radius:
            return True
        if bbox_intersects(minlon, minlat, maxlon, maxlat, s["lon"], s["lat"], radius):
            return True
    return False


def simplify_ring(ring, tolerance=0.00005):
    """Ramer–Douglas–Peucker algorithm."""
    if len(ring) <= 2:
        return ring

    # Find point with max distance from line
    max_dist = 0
    max_idx = 0
    for i in range(1, len(ring) - 1):
        # Distance from point to line (ring[0], ring[-1])
        x0, y0 = ring[i]
        x1, y1 = ring[0]
        x2, y2 = ring[-1]
        dx, dy = x2 - x1, y2 - y1
        mag = math.sqrt(dx * dx + dy * dy)
        if mag < 1e-10:
            dist = math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)
        else:
            dist = abs((x0 - x1) * dy - (y0 - y1) * dx) / mag
        if dist > max_dist:
            max_dist = dist
            max_idx = i

    if max_dist > tolerance:
        left = simplify_ring(ring[:max_idx + 1], tolerance)
        right = simplify_ring(ring[max_idx:], tolerance)
        return left[:-1] + right
    else:
        return [ring[0], ring[-1]]


def simplify_feature(feat, tolerance=0.00005):
    """Simplify polygon geometry."""
    geom = feat.get("geometry", {})
    gt = geom.get("type", "")
    if gt == "Polygon":
        geom["coordinates"] = [
            simplify_ring(ring, tolerance)
            for ring in geom.get("coordinates", [])
        ]
    elif gt == "MultiPolygon":
        geom["coordinates"] = [
            [simplify_ring(ring, tolerance) for ring in poly]
            for poly in geom.get("coordinates", [])
        ]
    return feat


if __name__ == "__main__":
    root = Path(__file__).parent.parent
    src = root / "webdev" / "backend" / "app" / "data" / "spatial" / "gistaru_pola_ruang_surabaya.geojson"

    print(f"Loading {src.stat().st_size // 1024 // 1024} MB GISTARU file...")
    with open(src, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data.get("features", []))
    print(f"Total features: {total}")

    print("Filtering to station catchments (radius ~2.8km)...")
    clipped = [f for f in data["features"] if feature_in_catchment(f, STATIONS, RADIUS_DEG)]
    print(f"After clip: {len(clipped)} features")

    print("Simplifying geometry (tolerance=0.0001°)...")
    simplified = [simplify_feature(f, tolerance=0.0001) for f in clipped]

    result = {
        "type": "FeatureCollection",
        "name": "RDTR Kota Surabaya — Rencana Pola Ruang (Koridor Stasiun)",
        "attribution": "Data: Kementerian ATR/BPN — GISTARU RTR Online (RDTR Kota Surabaya, Perda No. 8 Tahun 2018)",
        "features": simplified,
    }

    for out_dir in [
        root / "webdev" / "backend" / "app" / "data" / "spatial",
        root / "webdev" / "frontend" / "public" / "data",
    ]:
        out = out_dir / "gistaru_pola_ruang_surabaya.geojson"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False)
        print(f"Saved: {out} ({out.stat().st_size // 1024} KB)")

    print("Done!")
