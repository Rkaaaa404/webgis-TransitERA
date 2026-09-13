"""
Fixed extraction for GISTARU - use OBJECTID-based pagination and broader query.
"""
import json
import time
import urllib.request
import urllib.parse
import ssl

GISTARU_PROXY_BASE = "https://gistaru.atrbpn.go.id/proxy_rtronline/run.ashx"
GISTARU_MAPSERVER_BASE = (
    "https://gistaru.atrbpn.go.id/arcgis/rest/services/"
    "058_RDTR_PROVINSI_JAWA_TIMUR/_RDTR_35B8_KOTA_SURABAYA/MapServer/2"
)
GISTARU_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TransitERA/1.0",
    "Referer": "https://gistaru.atrbpn.go.id/rtronline/",
    "Accept": "application/json",
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def http_get(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=CTX, timeout=30) as resp:
        return resp.read()


def fetch_page_by_oid(min_oid: int, max_oid: int) -> dict:
    """Fetch features using OBJECTID range."""
    where = f"OBJECTID>={min_oid} AND OBJECTID<={max_oid}"
    params = urllib.parse.urlencode({
        "where": where,
        "outFields": "OBJECTID,NAMOBJ,NAMZON,KODZON,NAMSZN,KODSZN,KODBWP,KOSBWP,KODBLK,WADMKC,WADMKD,TOD_04,CAGBUD,LUASHA,NOTHPR",
        "f": "geojson",
        "outSR": "4326"
    })
    url = f"{GISTARU_PROXY_BASE}?{GISTARU_MAPSERVER_BASE}/query?{params}"
    data = http_get(url, GISTARU_HEADERS)
    return json.loads(data)


def get_oid_range() -> tuple:
    """Get the min and max OBJECTID in the layer."""
    params = urllib.parse.urlencode({
        "where": "1=1",
        "returnIdsOnly": "true",
        "f": "json"
    })
    url = f"{GISTARU_PROXY_BASE}?{GISTARU_MAPSERVER_BASE}/query?{params}"
    data = json.loads(http_get(url, GISTARU_HEADERS))
    oids = data.get("objectIds", [])
    if not oids:
        return 1, 11022
    return min(oids), max(oids)


def get_surabaya_oids():
    """Get all OIDs intersecting with Surabaya station corridor."""
    # Surabaya envelope
    bbox = "112.69,-7.40,112.85,-7.20"  # Full Surabaya
    geometry = json.dumps({
        "xmin": 112.69, "ymin": -7.40,
        "xmax": 112.85, "ymax": -7.20,
        "spatialReference": {"wkid": 4326}
    })
    params = urllib.parse.urlencode({
        "where": "1=1",
        "geometry": geometry,
        "geometryType": "esriGeometryEnvelope",
        "spatialRel": "esriSpatialRelIntersects",
        "inSR": "4326",
        "returnIdsOnly": "true",
        "f": "json"
    })
    url = f"{GISTARU_PROXY_BASE}?{GISTARU_MAPSERVER_BASE}/query?{params}"
    data = json.loads(http_get(url, GISTARU_HEADERS))
    return data.get("objectIds", [])


if __name__ == "__main__":
    from pathlib import Path

    print("Getting Surabaya OBJECTID list...")
    oids = get_surabaya_oids()
    print(f"Total Surabaya Pola Ruang features: {len(oids)}")

    if not oids:
        print("No OIDs returned! Trying full range fallback...")
        min_oid, max_oid = get_oid_range()
        print(f"Full range: {min_oid} - {max_oid}")
        oids = list(range(min_oid, min_oid + 50))

    all_features = []
    BATCH = 200  # Fetch 200 OIDs at a time
    total_batches = (len(oids) + BATCH - 1) // BATCH
    print(f"Fetching in {total_batches} batches of {BATCH}...")

    for i in range(0, len(oids), BATCH):
        batch = oids[i:i + BATCH]
        where = f"OBJECTID IN ({','.join(str(o) for o in batch)})"
        params = urllib.parse.urlencode({
            "where": where,
            "outFields": "OBJECTID,NAMOBJ,NAMZON,KODZON,NAMSZN,KODSZN,KODBWP,KOSBWP,KODBLK,WADMKC,WADMKD,TOD_04,CAGBUD,LUASHA,NOTHPR",
            "f": "geojson",
            "outSR": "4326"
        })
        url = f"{GISTARU_PROXY_BASE}?{GISTARU_MAPSERVER_BASE}/query?{params}"
        try:
            data = json.loads(http_get(url, GISTARU_HEADERS))
            feats = data.get("features", [])
            all_features.extend(feats)
            batch_num = i // BATCH + 1
            print(f"  Batch {batch_num}/{total_batches}: {len(feats)} features (total: {len(all_features)})")
        except Exception as e:
            print(f"  Batch {i//BATCH + 1} error: {e}")
        time.sleep(0.3)

    print(f"\nTotal extracted: {len(all_features)} Pola Ruang polygons")

    result = {
        "type": "FeatureCollection",
        "name": "RDTR Kota Surabaya — Rencana Pola Ruang",
        "attribution": "Data: Kementerian ATR/BPN — GISTARU RTR Online (RDTR Kota Surabaya, Perda No. 8 Tahun 2018)",
        "features": all_features,
    }

    root = Path(__file__).parent.parent
    backend_path = root / "webdev" / "backend" / "app" / "data" / "spatial" / "gistaru_pola_ruang_surabaya.geojson"
    frontend_path = root / "webdev" / "frontend" / "public" / "data" / "gistaru_pola_ruang_surabaya.geojson"

    for path in [backend_path, frontend_path]:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False)
        print(f"Saved: {path} ({path.stat().st_size // 1024} KB)")
