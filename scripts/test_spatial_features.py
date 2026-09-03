import json
import os
import h3
import shapely.geometry

data_dir = "webdev/backend/app/data/spatial"
files = [
    "demografi_surabaya.geojson",
    "halte_surabaya.geojson",
    "nighttime_light_surabaya.geojson",
    "stasiun_surabaya.geojson",
    "banjir_surabaya.geojson"
]

for fname in files:
    fpath = os.path.join(data_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"{fname}: {len(data.get('features', []))} features")

# Sample H3 cell (Gubeng center)
cell = h3.latlng_to_cell(-7.2654, 112.7521, 9)
boundary = h3.cell_to_boundary(cell)
poly = shapely.geometry.Polygon([[p[1], p[0]] for p in boundary])
print(f"Sample H3 poly ({cell}) bounds: {poly.bounds}")
