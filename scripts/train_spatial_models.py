"""
TransitERA Spatial Machine Learning Training Pipeline
Ingests canonical Surabaya GeoJSON datasets (Demografi, NTL, Halte, Stasiun, Banjir),
performs spatial joins to Uber H3 Resolution 9 hex cells,
executes StandardScaler + PCA (Principal Component Analysis),
trains a KNN / Random Forest classifier for TOD Typology,
and exports the trained model bundle to webdev/backend/app/analytics/tod_typology_model.joblib.
"""
import os
import json
import math
import numpy as np
import h3
from shapely.geometry import shape, Point, Polygon
from shapely.strtree import STRtree
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "webdev", "backend", "app", "data", "spatial")
OUTPUT_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "webdev", "backend", "app", "analytics")

STATION_COORDS = {
    "gubeng": (-7.2654, 112.7521, "Commercial Transit Hub"),
    "pasar_turi": (-7.2478, 112.7306, "Commercial Transit Hub"),
    "semut": (-7.2372, 112.7431, "Mixed-Use Heritage Core"),
    "wonokromo": (-7.3014, 112.7383, "Mixed-Use Residential Area"),
    "waru": (-7.3519, 112.7297, "Low-Accessibility Feeder Zone"),
}

def load_geojson(filename):
    fpath = os.path.join(DATA_DIR, filename)
    with open(fpath, "r", encoding="utf-8") as f:
        return json.load(f)

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    return 2 * R * math.asin(math.sqrt(a))

def train_tod_models():
    print("=== Memuat Dataset Spasial Surabaya ===")
    demografi_geojson = load_geojson("demografi_surabaya.geojson")
    halte_geojson = load_geojson("halte_surabaya.geojson")
    ntl_geojson = load_geojson("nighttime_light_surabaya.geojson")
    stasiun_geojson = load_geojson("stasiun_surabaya.geojson")
    banjir_geojson = load_geojson("banjir_surabaya.geojson")

    # Build Shapely geometries with spatial indexes (STRtree) for rapid querying
    print("Building spatial indexes...")
    demografi_shapes = []
    demografi_props = []
    for f in demografi_geojson["features"]:
        s = shape(f["geometry"])
        if s.is_valid:
            demografi_shapes.append(s)
            demografi_props.append(f["properties"])
    tree_demografi = STRtree(demografi_shapes)

    halte_points = []
    for f in halte_geojson["features"]:
        coords = f["geometry"]["coordinates"]
        halte_points.append(Point(coords[0], coords[1]))

    ntl_shapes = []
    ntl_props = []
    for f in ntl_geojson["features"]:
        s = shape(f["geometry"])
        if s.is_valid:
            ntl_shapes.append(s)
            ntl_props.append(f["properties"])
    tree_ntl = STRtree(ntl_shapes)

    stasiun_points = []
    for f in stasiun_geojson["features"]:
        coords = f["geometry"]["coordinates"]
        stasiun_points.append((coords[1], coords[0])) # (lat, lon)

    banjir_shapes = []
    for f in banjir_geojson["features"]:
        s = shape(f["geometry"])
        if s.is_valid:
            banjir_shapes.append(s)
    tree_banjir = STRtree(banjir_shapes)

    print("=== Melakukan Spatial Join ke Sel H3 Resolusi 9 ===")
    # Generate H3 clusters across all stations (k=3 rings = 37 cells per station, total 185 sample cells)
    sample_cells = []
    labels = []
    clusters_info = []

    for st_id, (st_lat, st_lon, default_typology) in STATION_COORDS.items():
        center_cell = h3.latlng_to_cell(st_lat, st_lon, 9)
        disk = list(h3.grid_disk(center_cell, 3)) # 37 cells around each station
        for cell in disk:
            ring_dist = h3.grid_distance(center_cell, cell)
            boundary = h3.cell_to_boundary(cell)
            poly = Polygon([[p[1], p[0]] for p in boundary])
            center_lat, center_lon = h3.cell_to_latlng(cell)

            # 1. Feature: Estimasi Penduduk
            pop_estimate = 0
            intersect_indices = tree_demografi.query(poly)
            for idx in intersect_indices:
                d_poly = demografi_shapes[idx]
                if poly.intersects(d_poly):
                    inter_area = poly.intersection(d_poly).area
                    tot_area = d_poly.area if d_poly.area > 0 else 1.0
                    pop_val = demografi_props[idx].get("JUMLAH PENDUDUK 2020", 15000) or 15000
                    pop_estimate += (inter_area / tot_area) * float(pop_val)
            pop_estimate = max(100.0, pop_estimate)

            # 2. Feature: NTL Radiance
            ntl_val = 25.0
            ntl_indices = tree_ntl.query(Point(center_lon, center_lat))
            for idx in ntl_indices:
                if ntl_shapes[idx].contains(Point(center_lon, center_lat)):
                    raw_val = ntl_props[idx].get("INTENSITAS (nW/sr/cm)", 45.0) or 45.0
                    try:
                        ntl_val = float(raw_val)
                    except ValueError:
                        ntl_val = 45.0
                    break

            # 3. Feature: Halte dalam 800m
            halte_count = sum(1 for hp in halte_points if haversine_km(center_lat, center_lon, hp.y, hp.x) <= 0.8)

            # 4. Feature: Jarak ke Stasiun Terdekat (km)
            min_dist_stasiun = min(haversine_km(center_lat, center_lon, slat, slon) for slat, slon in stasiun_points)

            # 5. Feature: Risiko Banjir (overlap area ratio)
            flood_overlap = 0.0
            banjir_indices = tree_banjir.query(poly)
            for idx in banjir_indices:
                b_poly = banjir_shapes[idx]
                if poly.intersects(b_poly):
                    flood_overlap += poly.intersection(b_poly).area
            flood_pct = min(100.0, (flood_overlap / poly.area) * 100.0) if poly.area > 0 else 0.0

            # Determine typology label based on station context and ring distance
            if ring_dist == 0:
                cell_label = default_typology
            elif ring_dist == 1:
                cell_label = default_typology if default_typology != "Low-Accessibility Feeder Zone" else "Low-Accessibility Feeder Zone"
            elif ring_dist >= 2 and min_dist_stasiun > 0.9:
                cell_label = "Low-Accessibility Feeder Zone"
            else:
                cell_label = default_typology if "Mixed-Use" in default_typology else "Mixed-Use Residential Area"

            feature_vector = [
                math.log1p(pop_estimate),     # log(1 + populasi)
                ntl_val,                      # ntl radiance
                halte_count,                  # halte bus/feeder count
                min_dist_stasiun,             # distance to train station km
                flood_pct                     # flood vulnerability %
            ]

            sample_cells.append(feature_vector)
            labels.append(cell_label)
            clusters_info.append({"cell": cell, "station": st_id, "ring": ring_dist})

    X = np.array(sample_cells)
    y = np.array(labels)
    print(f"Total dataset sampel sel H3: {len(X)} sampel dengan {X.shape[1]} fitur.")
    print("Distribusi kelas:", {cls: int((y == cls).sum()) for cls in set(y)})

    # 1. Feature Normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 2. Dimensionality Reduction via PCA
    pca = PCA(n_components=3, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    var_ratio = pca.explained_variance_ratio_
    print(f"PCA Variance Explained: {var_ratio} (Total: {var_ratio.sum()*100:.2f}%)")

    # 3. Model Training (KNN Classifier + Random Forest Ensemble)
    knn_classifier = KNeighborsClassifier(n_neighbors=5, weights="distance")
    knn_classifier.fit(X_pca, y)

    rf_classifier = RandomForestClassifier(n_estimators=50, random_state=42)
    rf_classifier.fit(X_pca, y)

    knn_acc = knn_classifier.score(X_pca, y)
    rf_acc = rf_classifier.score(X_pca, y)
    print(f"Model Training Accuracy -> KNN: {knn_acc*100:.1f}%, Random Forest: {rf_acc*100:.1f}%")

    # 4. Save Model Bundle
    model_bundle = {
        "scaler": scaler,
        "pca": pca,
        "classifier": rf_classifier,
        "knn_classifier": knn_classifier,
        "classes": list(rf_classifier.classes_),
        "feature_names": [
            "log_population",
            "ntl_radiance",
            "feeder_halte_count_800m",
            "distance_to_station_km",
            "flood_hazard_pct"
        ],
        "explained_variance_ratio": var_ratio.tolist(),
        "pca_components": pca.components_.tolist()
    }

    os.makedirs(OUTPUT_MODEL_DIR, exist_ok=True)
    out_model_path = os.path.join(OUTPUT_MODEL_DIR, "tod_typology_model.joblib")
    joblib.dump(model_bundle, out_model_path)
    print(f"Model bundle berhasil disimpan ke: {out_model_path}")
    return model_bundle

if __name__ == "__main__":
    train_tod_models()
