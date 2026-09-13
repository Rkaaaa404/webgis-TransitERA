"""
Extract GISTARU RTR Online & BHUMI ATR/BPN spatial data for TransitERA Surabaya.

Data Sources:
- GISTARU: Kementerian ATR/BPN — RDTR Kota Surabaya (Perda No. 8 Tahun 2018)
  URL: https://gistaru.atrbpn.go.id/rtronline/
  Layer: 058_RDTR_PROVINSI_JAWA_TIMUR/_RDTR_35B8_KOTA_SURABAYA/MapServer/2
- BHUMI: Kementerian ATR/BPN — Peta Interaktif Bidang Tanah Terdaftar
  URL: https://bhumi.atrbpn.go.id/peta

Saves:
- webdev/backend/app/data/spatial/gistaru_pola_ruang_surabaya.geojson
- webdev/backend/app/data/spatial/bhumi_persil_surabaya.geojson
- webdev/frontend/public/data/gistaru_pola_ruang_surabaya.geojson
- webdev/frontend/public/data/bhumi_persil_surabaya.geojson
"""

import json
import math
import base64
import hashlib
import time
import os
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

# ── AES Decryption (OpenSSL-compatible, same as CryptoJS) ────────────────────
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding as crypto_padding

AES_KEY = "s3CRetCR1pT0"

def decrypt_cryptojs(encrypted_b64: str) -> str:
    raw = base64.b64decode(encrypted_b64)
    assert raw[:8] == b"Salted__", "Invalid Salted__ header"
    salt = raw[8:16]
    ciphertext = raw[16:]
    key_iv = b""
    prev = b""
    pass_bytes = AES_KEY.encode("utf-8")
    while len(key_iv) < 48:
        prev = hashlib.md5(prev + pass_bytes + salt).digest()
        key_iv += prev
    key = key_iv[:32]
    iv = key_iv[32:48]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    unpadder = crypto_padding.PKCS7(128).unpadder()
    plaintext = unpadder.update(padded) + unpadder.finalize()
    return plaintext.decode("utf-8")


# ── Utility: HTTP with retries ────────────────────────────────────────────────
def http_get(url: str, headers: dict, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=headers)
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
        return resp.read()

def http_post_json(url: str, payload: dict, headers: dict, timeout: int = 30) -> bytes:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={**headers, "Content-Type": "application/json"}, method="POST")
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
        return resp.read()


# ── TransitERA Station Coordinates ────────────────────────────────────────────
STATIONS = [
    {"id": "gubeng",            "lat": -7.2654,  "lon": 112.7521},
    {"id": "pasar_turi",        "lat": -7.2478,  "lon": 112.7306},
    {"id": "semut",             "lat": -7.2372,  "lon": 112.7431},
    {"id": "wonokromo",         "lat": -7.3014,  "lon": 112.7383},
    {"id": "waru",              "lat": -7.3547,  "lon": 112.7297},
    {"id": "terminal_joyoboyo", "lat": -7.2995,  "lon": 112.7368},
    {"id": "ngagel",            "lat": -7.2878,  "lon": 112.7482},
]

RADIUS_DEG = 0.018  # ~2km radius in degrees


def station_bbox(lat: float, lon: float, radius: float = RADIUS_DEG) -> tuple:
    """Returns (minLon, minLat, maxLon, maxLat)"""
    return (lon - radius, lat - radius, lon + radius, lat + radius)


def merge_bbox(bboxes: list) -> tuple:
    """Merge multiple (minLon, minLat, maxLon, maxLat) into one envelope."""
    return (
        min(b[0] for b in bboxes),
        min(b[1] for b in bboxes),
        max(b[2] for b in bboxes),
        max(b[3] for b in bboxes),
    )


# ══════════════════════════════════════════════════════════════════════════════
# PART 1: GISTARU RTR Online — Rencana Pola Ruang RDTR Kota Surabaya
# ══════════════════════════════════════════════════════════════════════════════

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


def fetch_gistaru_page(bbox: tuple, offset: int = 0, count: int = 1000) -> list:
    """Fetch a page of Pola Ruang features from GISTARU proxy."""
    minlon, minlat, maxlon, maxlat = bbox
    geometry = json.dumps({
        "xmin": minlon, "ymin": minlat,
        "xmax": maxlon, "ymax": maxlat,
        "spatialReference": {"wkid": 4326}
    })
    params = urllib.parse.urlencode({
        "where": "1=1",
        "geometry": geometry,
        "geometryType": "esriGeometryEnvelope",
        "spatialRel": "esriSpatialRelIntersects",
        "inSR": "4326",
        "outSR": "4326",
        "outFields": "NAMOBJ,NAMZON,KODZON,NAMSZN,KODSZN,KODBWP,KOSBWP,KODBLK,WADMKC,WADMKD,TOD_04,CAGBUD,LUASHA,NOTHPR",
        "f": "geojson",
        "resultOffset": offset,
        "resultRecordCount": count,
    })
    url = f"{GISTARU_PROXY_BASE}?{GISTARU_MAPSERVER_BASE}/query?{params}"
    data = http_get(url, GISTARU_HEADERS, timeout=30)
    return json.loads(data).get("features", [])


def build_gistaru_geojson() -> dict:
    """Fetch all Pola Ruang polygons within station catchments and merge into FeatureCollection."""
    print("Fetching GISTARU RDTR Surabaya Pola Ruang...")
    seen_ids = set()
    all_features = []

    # Build combined envelope over all stations
    bboxes = [station_bbox(s["lat"], s["lon"], RADIUS_DEG) for s in STATIONS]
    big_bbox = merge_bbox(bboxes)

    offset = 0
    page_size = 1000
    while True:
        print(f"  Fetching offset={offset}...")
        try:
            features = fetch_gistaru_page(big_bbox, offset=offset, count=page_size)
        except Exception as e:
            print(f"  GISTARU fetch error at offset {offset}: {e}")
            break

        new_features = []
        for f in features:
            fid = f.get("id") or f.get("properties", {}).get("OBJECTID")
            if fid not in seen_ids:
                seen_ids.add(fid)
                new_features.append(f)

        all_features.extend(new_features)
        print(f"  Got {len(new_features)} new features (total: {len(all_features)})")

        if len(features) < page_size:
            break
        offset += page_size
        time.sleep(0.5)

    print(f"GISTARU: Total {len(all_features)} Pola Ruang polygons extracted.")
    return {
        "type": "FeatureCollection",
        "name": "RDTR Kota Surabaya — Rencana Pola Ruang",
        "attribution": "Data: Kementerian ATR/BPN — GISTARU RTR Online (RDTR Kota Surabaya, Perda No. 8 Tahun 2018)",
        "features": all_features,
    }


# ══════════════════════════════════════════════════════════════════════════════
# PART 2: BHUMI ATR/BPN — Persil Bidang Tanah
# ══════════════════════════════════════════════════════════════════════════════

BHUMI_BASE = "https://bhumi.atrbpn.go.id"
BHUMI_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TransitERA/1.0",
    "Referer": "https://bhumi.atrbpn.go.id/peta",
    "Origin": "https://bhumi.atrbpn.go.id",
}

def bhumi_login() -> str:
    """Login to Bhumi API and return JWT token."""
    payload = {"username": "user", "password": "password"}
    data = http_post_json(f"{BHUMI_BASE}/expapi/loginApi", payload, BHUMI_HEADERS)
    token = json.loads(data)
    print(f"  Bhumi token acquired: {token[:40]}...")
    return token

def bhumi_get_persil(token: str, bbox: tuple, width: int = 800, height: int = 600) -> list:
    """
    Query /expapi/getPersil for a bounding box.
    Returns list of GeoJSON features (decrypted).
    """
    minlon, minlat, maxlon, maxlat = bbox
    bbox_str = f"{minlon},{minlat},{maxlon},{maxlat}"

    # Use GetFeatureInfo-style request
    body = {
        "service_layer_name": "umum:Persil",
        "width": width,
        "height": height,
        "bbox": bbox_str,
        "x": width // 2,
        "y": height // 2,
        "query_layers": "umum:Persil",
        "url": "/expapi/getPersil",
        "service": "/bhumigs/umum",
        "FEATURE_COUNT": "50",
    }

    headers_with_auth = {
        **BHUMI_HEADERS,
        "Authorization": token,
        "Content-Type": "application/json",
    }
    data = http_post_json(f"{BHUMI_BASE}/expapi/getPersil", body, headers_with_auth)
    enc_res = json.loads(data)

    if enc_res.get("encrypted") and enc_res.get("data"):
        decrypted = decrypt_cryptojs(enc_res["data"])
        feature_col = json.loads(decrypted)
        return feature_col.get("features", [])

    if "features" in enc_res:
        return enc_res["features"]

    return []


def build_bhumi_geojson() -> dict:
    """Extract Persil data around each station and merge into FeatureCollection."""
    print("Fetching BHUMI ATR/BPN Persil Tanah...")
    token = bhumi_login()

    seen_nibs = set()
    all_features = []

    for station in STATIONS:
        print(f"  Station: {station['id']} ({station['lat']}, {station['lon']})")
        try:
            bbox = station_bbox(station["lat"], station["lon"], radius=0.01)  # ~1km
            features = bhumi_get_persil(token, bbox)
            new_features = []
            for f in features:
                props = f.get("properties", {})
                nib = props.get("nib") or props.get("persilpasifid", "")
                lat_lon_key = (station["lat"], station["lon"])
                # Use a unique key per feature
                unique_key = nib or f.get("id", "")
                if unique_key and unique_key not in seen_nibs:
                    seen_nibs.add(unique_key)
                    f["properties"]["_station_id"] = station["id"]
                    new_features.append(f)

            all_features.extend(new_features)
            print(f"    Got {len(new_features)} new persil (total: {len(all_features)})")
        except Exception as e:
            print(f"    Error for {station['id']}: {e}")

        time.sleep(1.0)  # Rate-limit

    print(f"BHUMI: Total {len(all_features)} Persil features extracted.")
    return {
        "type": "FeatureCollection",
        "name": "Bidang Tanah Terdaftar — BHUMI ATR/BPN",
        "attribution": "Data: Kementerian ATR/BPN — Peta Interaktif BHUMI (Persil Bidang Tanah Terdaftar)",
        "features": all_features,
    }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN — Save GeoJSON files
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    root = Path(__file__).parent.parent

    backend_spatial = root / "webdev" / "backend" / "app" / "data" / "spatial"
    frontend_public = root / "webdev" / "frontend" / "public" / "data"

    backend_spatial.mkdir(parents=True, exist_ok=True)
    frontend_public.mkdir(parents=True, exist_ok=True)

    # 1. GISTARU Pola Ruang
    print("\n" + "=" * 60)
    print("EXTRACTING GISTARU RTR ONLINE — RDTR KOTA SURABAYA")
    print("=" * 60)
    gistaru_geojson = build_gistaru_geojson()

    gistaru_backend = backend_spatial / "gistaru_pola_ruang_surabaya.geojson"
    gistaru_frontend = frontend_public / "gistaru_pola_ruang_surabaya.geojson"
    with open(gistaru_backend, "w", encoding="utf-8") as f:
        json.dump(gistaru_geojson, f, ensure_ascii=False, indent=None)
    with open(gistaru_frontend, "w", encoding="utf-8") as f:
        json.dump(gistaru_geojson, f, ensure_ascii=False, indent=None)
    print(f"Saved: {gistaru_backend} ({gistaru_backend.stat().st_size // 1024} KB)")
    print(f"Saved: {gistaru_frontend} ({gistaru_frontend.stat().st_size // 1024} KB)")

    # 2. BHUMI Persil
    print("\n" + "=" * 60)
    print("EXTRACTING BHUMI ATR/BPN — PERSIL BIDANG TANAH")
    print("=" * 60)
    bhumi_geojson = build_bhumi_geojson()

    bhumi_backend = backend_spatial / "bhumi_persil_surabaya.geojson"
    bhumi_frontend = frontend_public / "bhumi_persil_surabaya.geojson"
    with open(bhumi_backend, "w", encoding="utf-8") as f:
        json.dump(bhumi_geojson, f, ensure_ascii=False, indent=None)
    with open(bhumi_frontend, "w", encoding="utf-8") as f:
        json.dump(bhumi_geojson, f, ensure_ascii=False, indent=None)
    print(f"Saved: {bhumi_backend} ({bhumi_backend.stat().st_size // 1024} KB)")
    print(f"Saved: {bhumi_frontend} ({bhumi_frontend.stat().st_size // 1024} KB)")

    print("\nDone!")
