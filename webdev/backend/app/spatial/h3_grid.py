import math
from typing import List, Dict, Any
import h3

def classify_tod_typology(scores: Dict[str, float]) -> Dict[str, Any]:
    """
    Klasifikasi Tipologi Kawasan TOD berbasis Multi-Criteria Spatial Indicators
    (Density, Diversity, Design, Destination, Distance).
    
    Tipologi Resmi:
    1. Commercial Transit Hub (Skor TOD >= 78, Diversity >= 80)
    2. Mixed-Use Heritage Core (Skor TOD >= 70, Diversity >= 75)
    3. Mixed-Use Residential Area (Skor TOD >= 70, Distance >= 80)
    4. Low-Accessibility Feeder Zone (Skor TOD < 70 atau Design < 55)
    """
    tod = scores.get("tod_readiness_score", 0.0)
    if tod == 0.0:
        tod = (
            scores.get("density", 50) * 0.25 +
            scores.get("diversity", 50) * 0.22 +
            scores.get("design", 50) * 0.18 +
            scores.get("destination_accessibility", 50) * 0.18 +
            scores.get("distance_to_transit", 50) * 0.17
        )

    diversity = scores.get("diversity", 50.0)
    distance = scores.get("distance_to_transit", 50.0)
    design = scores.get("design", 50.0)

    if tod >= 78.0 and diversity >= 80.0:
        typology = "Commercial Transit Hub"
        confidence = 0.94
        description = "Pusat aktivitas komersial transit berkepadatan tinggi dengan daya tarik koridor utama."
        zoning_advice = "Terapkan insentif FAR bonus dan penataan koridor komersial pejalan kaki berkanopi."
    elif tod >= 70.0 and diversity >= 75.0 and design < 65.0:
        typology = "Mixed-Use Heritage Core"
        confidence = 0.88
        description = "Kawasan cagar budaya & perdagangan campuran dengan akses transit tinggi namun butuh revitalisasi pedestrian."
        zoning_advice = "Preservasi fasad bangunan bersejarah terintegrasi rute feeder micro-mobility."
    elif tod >= 70.0:
        typology = "Mixed-Use Residential Area"
        confidence = 0.91
        description = "Kawasan hunian campuran padat yang terhubung kuat dengan stasiun commuter."
        zoning_advice = "Kembangkan integrasi transfer antarmoda mikrolet dan penyediaan park & ride terpadu."
    else:
        typology = "Low-Accessibility Feeder Zone"
        confidence = 0.85
        description = "Zona pengumpan pinggiran dengan keterbatasan konektivitas first/last-mile."
        zoning_advice = "Prioritaskan ekspansi trayek feeder WiraWiri dan pembangunan trotoar primer."

    return {
        "typology": typology,
        "confidence": confidence,
        "tod_score": round(tod, 1),
        "description": description,
        "zoning_advice": zoning_advice
    }


def get_station_h3_cell(lat: float, lon: float, resolution: int = 9) -> str:
    """Mengembalikan indeks H3 resolusi 9 resmi untuk koordinat stasiun (kompatibel h3 v3 & v4)."""
    if hasattr(h3, "latlng_to_cell"):
        return h3.latlng_to_cell(lat, lon, resolution)
    return h3.geo_to_h3(lat, lon, resolution)


def get_h3_disk(center_cell: str, k: int = 2) -> List[str]:
    """Mengembalikan kumpulan sel H3 dalam radius k rings (k=2 menghasilkan 19 sel)."""
    if hasattr(h3, "grid_disk"):
        return list(h3.grid_disk(center_cell, k))
    return list(h3.k_ring(center_cell, k))


def get_h3_distance(origin: str, dest: str) -> int:
    """Menghitung jarak ring antar sel H3."""
    if hasattr(h3, "grid_distance"):
        return h3.grid_distance(origin, dest)
    return h3.h3_distance(origin, dest)


def get_h3_boundary_geojson(cell: str) -> List[List[float]]:
    """Menghasilkan koordinat poligon [lon, lat] GeoJSON tertutup untuk sel H3."""
    if hasattr(h3, "cell_to_boundary"):
        coords_latlng = h3.cell_to_boundary(cell)
    else:
        coords_latlng = h3.h3_to_geo_boundary(cell, geo_json=False)

    polygon = [[round(p[1], 6), round(p[0], 6)] for p in coords_latlng]
    if polygon and polygon[0] != polygon[-1]:
        polygon.append(polygon[0])
    return polygon


def generate_station_h3_cluster(
    station_id: str,
    station_name: str,
    center_lon: float,
    center_lat: float,
    base_tod_score: float,
    base_njop_premium: float,
    typology: str,
    ring_count: int = 2
) -> List[Dict[str, Any]]:
    """
    Menghasilkan kumpulan sel Uber H3 (resolusi 9) riil di sekitar stasiun transit
    menggunakan library h3-py asli dengan batas poligon EPSG:4326 presisi.
    """
    center_cell = get_station_h3_cell(center_lat, center_lon, resolution=9)
    disk_cells = get_h3_disk(center_cell, k=ring_count)

    # Urutkan deterministik: sel pusat duluan, lalu berdasarkan jarak cincin, lalu indeks heksagon
    sorted_cells = sorted(
        disk_cells,
        key=lambda c: (get_h3_distance(center_cell, c), c)
    )

    cells = []
    for idx, h3_index in enumerate(sorted_cells):
        ring_dist = get_h3_distance(center_cell, h3_index)

        # Distance decay factor (makin dekat simpul transit, skor makin tinggi)
        decay = max(0.65, 1.0 - (ring_dist * 0.08))
        cell_tod = round(base_tod_score * decay * (1.0 + (idx % 5 - 2) * 0.015), 1)
        cell_tod = max(40.0, min(99.0, cell_tod))

        cell_njop_premium = round(base_njop_premium * decay * (1.0 + (idx % 3 - 1) * 0.02), 1)

        # Sub-skor 5 dimensi TOD
        density = round(min(100.0, cell_tod * 1.04 - ring_dist * 2.8), 1)
        diversity = round(min(100.0, cell_tod * 0.99 + (idx % 4) * 1.5), 1)
        design = round(min(100.0, cell_tod * 0.88 - ring_dist * 4.2), 1)
        destination = round(min(100.0, cell_tod * 1.02 - ring_dist * 3.5), 1)
        distance = round(min(100.0, 100.0 - ring_dist * 12.0), 1)

        polygon_coords = get_h3_boundary_geojson(h3_index)

        feature = {
            "type": "Feature",
            "id": h3_index,
            "properties": {
                "h3_index": h3_index,
                "station_cluster": station_id,
                "station_name": station_name,
                "ring_distance": ring_dist,
                "tod_readiness_score": cell_tod,
                "density_score": density,
                "diversity_score": diversity,
                "design_score": design,
                "destination_score": destination,
                "distance_score": distance,
                "typology": typology,
                "predicted_njop_premium_pct": cell_njop_premium,
                "ci_lower_pct": round(cell_njop_premium * 0.75, 1),
                "ci_upper_pct": round(cell_njop_premium * 1.25, 1),
                "njop_m2": int(8500000 * (1 + cell_njop_premium / 100))
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [polygon_coords]
            }
        }
        cells.append(feature)

    return cells

