"""
TransitERA Spatial Machine Learning Training Pipeline
Ingests canonical Surabaya GeoJSON datasets (Demografi, NTL, Halte, Stasiun, Banjir),
performs spatial joins to Uber H3 Resolution 9 hex cells across all 15 passenger rail stations,
executes StandardScaler + PCA (Principal Component Analysis),
performs Unsupervised K-Means Clustering on the spatial feature manifold,
profiles cluster centroids to analytically determine TOD Typologies from data,
trains a Random Forest classifier to map spatial features to data-driven typologies,
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
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "webdev", "backend", "app", "data", "spatial")
OUTPUT_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "webdev", "backend", "app", "analytics")

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

def parse_ntl_radiance(props):
    dn = props.get("DN")
    k = str(props.get("KELAS") or props.get("INTENSITAS (nW/sr/cm)") or "").upper()
    if dn == 5 or "TINGGI" in k:
        return 45.0
    elif dn == 4 or "SEDANG" in k:
        return 15.0
    elif dn == 3 or "RENDAH" in k:
        return 7.5
    elif dn == 2 or "SANGAT RENDAH" in k:
        return 4.0
    return 1.5

def train_tod_models():
    print("=== 1. Memuat Dataset Spasial Surabaya ===")
    demografi_geojson = load_geojson("demografi_surabaya.geojson")
    halte_geojson = load_geojson("halte_surabaya.geojson")
    ntl_geojson = load_geojson("nighttime_light_surabaya.geojson")
    stasiun_geojson = load_geojson("stasiun_surabaya.geojson")
    banjir_geojson = load_geojson("banjir_surabaya.geojson")

    print("Building spatial indexes (STRtree)...")
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

    # Ingest all stations from stasiun_surabaya.geojson + Southern Gateway (Waru)
    stasiun_points = []
    seen_coords = set()
    for f in stasiun_geojson["features"]:
        coords = f["geometry"]["coordinates"]
        pt = (coords[1], coords[0]) # (lat, lon)
        key = (round(coords[1], 4), round(coords[0], 4))
        if key not in seen_coords:
            seen_coords.add(key)
            stasiun_points.append(pt)

    # Ensure Stasiun Waru is included as vital southern commuter node
    waru_pt = (-7.3519, 112.7297)
    if (round(waru_pt[0], 4), round(waru_pt[1], 4)) not in seen_coords:
        stasiun_points.append(waru_pt)

    print(f"Total Stasiun Teridentifikasi: {len(stasiun_points)} stasiun.")

    banjir_shapes = []
    banjir_props = []
    for f in banjir_geojson["features"]:
        s = shape(f["geometry"])
        if s.is_valid:
            banjir_shapes.append(s)
            banjir_props.append(f["properties"])
    tree_banjir = STRtree(banjir_shapes)

    print("=== 2. Melakukan Spatial Join ke Sel H3 Resolusi 9 ===")
    # Generate H3 Resolution 9 hex cells around all stations (k=3 rings = 37 cells/station)
    unique_cells = set()
    for slat, slon in stasiun_points:
        center_cell = h3.latlng_to_cell(slat, slon, 9)
        disk = h3.grid_disk(center_cell, 3)
        unique_cells.update(disk)

    cell_list = list(unique_cells)
    print(f"Total Sel H3 Resolusi 9 unik: {len(cell_list)} sel di seluruh koridor transit Surabaya.")

    sample_features = []
    cell_metadata = []

    for cell in cell_list:
        center_lat, center_lon = h3.cell_to_latlng(cell)
        boundary = h3.cell_to_boundary(cell)
        poly = Polygon([[p[1], p[0]] for p in boundary])

        # 1. Feature: Estimasi Kepadatan/Populasi
        pop_estimate = 0
        intersect_indices = tree_demografi.query(poly)
        for idx in intersect_indices:
            d_poly = demografi_shapes[idx]
            if poly.intersects(d_poly):
                inter_area = poly.intersection(d_poly).area
                tot_area = d_poly.area if d_poly.area > 0 else 1.0
                pop_val = demografi_props[idx].get("JUMLAH PENDUDUK 2024") or demografi_props[idx].get("JUMLAH PENDUDUK 2020", 15000) or 15000
                pop_estimate += (inter_area / tot_area) * float(pop_val)
        pop_estimate = max(100.0, pop_estimate)

        # 2. Feature: NTL Radiance
        ntl_val = 25.0
        ntl_indices = tree_ntl.query(Point(center_lon, center_lat))
        for idx in ntl_indices:
            if ntl_shapes[idx].contains(Point(center_lon, center_lat)):
                ntl_val = parse_ntl_radiance(ntl_props[idx])
                break

        # 3. Feature: Halte Feeder dalam 800m
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

        vec = [
            math.log1p(pop_estimate),     # log(1 + populasi)
            ntl_val,                      # ntl radiance
            float(halte_count),           # feeder halte count (800m)
            min_dist_stasiun,             # distance to train station (km)
            flood_pct                     # flood hazard (%)
        ]

        sample_features.append(vec)
        cell_metadata.append({"cell": cell, "lat": center_lat, "lon": center_lon})

    X = np.array(sample_features)
    print(f"Ekstraksi selesai: {len(X)} sampel sel dengan {X.shape[1]} fitur continuous.")

    # Compute baseline municipal statistics for dynamic diagnostics
    baseline_stats = {
        "mean": X.mean(axis=0).tolist(),
        "std": X.std(axis=0).tolist(),
        "min": X.min(axis=0).tolist(),
        "max": X.max(axis=0).tolist(),
        "median": np.median(X, axis=0).tolist()
    }

    # 1. Feature Normalization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 2. Dimensionality Reduction via PCA
    pca = PCA(n_components=4, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    var_ratio = pca.explained_variance_ratio_
    print(f"PCA Variance Explained (4 components): {var_ratio.sum()*100:.2f}% (Ratios: {var_ratio.round(3).tolist()})")

    # 3. Unsupervised Spatial Clustering (K-Means on Manifold)
    # The typology is NOT predestinated by manual labels; it is derived from cluster analysis.
    k_clusters = 4
    kmeans = KMeans(n_clusters=k_clusters, random_state=42, n_init=20)
    cluster_assignments = kmeans.fit_predict(X_scaled)

    # 4. Mathematical Centroid Profiling & Data-Driven Typology Characterization
    cluster_profiles = {}
    cluster_typologies = {}

    centroid_records = []
    for c_id in range(k_clusters):
        mask = (cluster_assignments == c_id)
        c_samples = X[mask]
        mean_feat = c_samples.mean(axis=0)
        std_feat = c_samples.std(axis=0)
        count = int(mask.sum())

        centroid_records.append({
            "cluster_id": c_id,
            "count": count,
            "mean_log_pop": mean_feat[0],
            "mean_pop": math.expm1(mean_feat[0]),
            "mean_ntl": mean_feat[1],
            "mean_halte": mean_feat[2],
            "mean_dist": mean_feat[3],
            "mean_flood": mean_feat[4],
            "raw_means": mean_feat.tolist(),
            "raw_stds": std_feat.tolist()
        })

    # Sort & characterize clusters based on quantitative multi-criteria dominance:
    # - Highest Feeder & NTL with close transit -> Commercial Transit Hub
    # - Closest distance to station with dense population -> Mixed-Use Residential Area
    # - Historic core / balanced characteristics -> Mixed-Use Heritage Core
    # - Farthest distance / low feeder connectivity -> Low-Accessibility Feeder Zone

    # Characterize clusters based on multi-criteria spatial dominance:
    # 1. Commercial Transit Hub: highest transit connectivity (halte count) and commercial radiance (NTL)
    hub_rec = max(centroid_records, key=lambda c: (c["mean_halte"], c["mean_ntl"]))
    hub_cluster = hub_rec["cluster_id"]

    rem = [c for c in centroid_records if c["cluster_id"] != hub_cluster]
    # 2. Low-Accessibility Feeder Zone: lowest commercial radiance (NTL) & low transit
    feeder_rec = min(rem, key=lambda c: (c["mean_ntl"], c["mean_halte"]))
    feeder_cluster = feeder_rec["cluster_id"]

    rem2 = [c for c in rem if c["cluster_id"] != feeder_cluster]
    # 3. Mixed-Use Residential Area: highest residential population density
    res_rec = max(rem2, key=lambda c: c["mean_pop"])
    residential_cluster = res_rec["cluster_id"]

    rem3 = [c for c in rem2 if c["cluster_id"] != residential_cluster]
    # 4. Mixed-Use Heritage Core: intermediate commercial/cultural core with low flood hazard
    heritage_cluster = rem3[0]["cluster_id"]

    cluster_typologies[hub_cluster] = "Commercial Transit Hub"
    cluster_typologies[residential_cluster] = "Mixed-Use Residential Area"
    cluster_typologies[heritage_cluster] = "Mixed-Use Heritage Core"
    cluster_typologies[feeder_cluster] = "Low-Accessibility Feeder Zone"

    print("\n=== Hasil Analisis Kluster Unsupervised & Karakterisasi Centroid ===")
    for rec in centroid_records:
        cid = rec["cluster_id"]
        label = cluster_typologies[cid]
        rec["typology_label"] = label
        cluster_profiles[cid] = rec
        print(f"Cluster {cid} -> '{label}' (N={rec['count']} sel):")
        print(f"  Pop: {rec['mean_pop']:.0f} | NTL: {rec['mean_ntl']:.1f} | Halte: {rec['mean_halte']:.1f} | Dist: {rec['mean_dist']:.2f}km | Flood: {rec['mean_flood']:.1f}%")

    # Create target y labels from unsupervised cluster assignments
    y = np.array([cluster_typologies[c] for c in cluster_assignments])

    # 5. Fit Classifier Ensemble on Latent PCA Space
    rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_classifier.fit(X_pca, y)

    knn_classifier = KNeighborsClassifier(n_neighbors=5, weights="distance")
    knn_classifier.fit(X_pca, y)

    rf_acc = rf_classifier.score(X_pca, y)
    knn_acc = knn_classifier.score(X_pca, y)
    print(f"\nModel Fitting Accuracy on Discovered Clusters -> RF: {rf_acc*100:.1f}%, KNN: {knn_acc*100:.1f}%")

    # 6. Save Complete Model Bundle with Analytical Metadata
    model_bundle = {
        "scaler": scaler,
        "pca": pca,
        "classifier": rf_classifier,
        "knn_classifier": knn_classifier,
        "kmeans": kmeans,
        "classes": list(rf_classifier.classes_),
        "cluster_typologies": cluster_typologies,
        "cluster_profiles": cluster_profiles,
        "baseline_stats": baseline_stats,
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
    print(f"\nModel bundle hasil analisis unsupervised berhasil disimpan ke: {out_model_path}")
    return model_bundle

if __name__ == "__main__":
    train_tod_models()
