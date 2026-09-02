import json
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import engine, is_db_connected
from app.db.models import Base, Station, H3TodAnalytics, SurveyPoint
from app.data.stations_data import STATIONS_DATA, get_all_h3_features
from app.spatial.h3_grid import generate_station_h3_cluster

logger = logging.getLogger(__name__)


def create_tables_if_needed():
    """Membuat tabel PostGIS secara otomatis jika belum ada."""
    if not is_db_connected() or engine is None:
        logger.warning("[Seeder] Database tidak terkoneksi. Pembuatan tabel dibatalkan.")
        return False

    try:
        with engine.connect() as conn:
            # Pastikan ekstensi postgis aktif
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()

        Base.metadata.create_all(bind=engine)
        logger.info("[Seeder] Tabel-tabel PostGIS berhasil diverifikasi/dibuat.")
        return True
    except Exception as e:
        logger.error(f"[Seeder] Gagal membuat tabel PostGIS: {e}")
        return False


def seed_database(db: Session, force: bool = False) -> Dict[str, Any]:
    """
    Mengisi database PostGIS dengan data 5 stasiun SRRL Surabaya dan
    95 sel Uber H3 (resolusi 9) riil lengkap dengan geometri EPSG:4326.
    """
    if not is_db_connected() or db is None:
        return {
            "status": "skipped",
            "message": "Database PostGIS tidak terkoneksi. Data tetap disajikan via In-Memory fallback."
        }

    # Pastikan tabel sudah ada
    create_tables_if_needed()

    stations_count = db.query(Station).count()
    if stations_count > 0 and not force:
        h3_count = db.query(H3TodAnalytics).count()
        return {
            "status": "already_seeded",
            "message": f"Database telah terisi sebelumnya ({stations_count} stasiun, {h3_count} sel H3). Gunakan force=True jika ingin menimpa data.",
            "stations_seeded": stations_count,
            "h3_cells_seeded": h3_count
        }

    logger.info("[Seeder] Memulai seeding data stasiun dan grid H3 ke PostGIS...")

    # Hapus data lama jika force=True
    if force:
        db.query(SurveyPoint).delete()
        db.query(H3TodAnalytics).delete()
        db.query(Station).delete()
        db.commit()

    # 1. Seed Tabel Stations
    stations_seeded = 0
    for s_id, s_data in STATIONS_DATA.items():
        point_geom = f"SRID=4326;POINT({s_data['longitude']} {s_data['latitude']})"
        station = Station(
            id=s_data["id"],
            name=s_data["name"],
            latitude=s_data["latitude"],
            longitude=s_data["longitude"],
            tod_readiness_score=s_data["tod_readiness_score"],
            density_score=s_data["scores"]["density"],
            diversity_score=s_data["scores"]["diversity"],
            design_score=s_data["scores"]["design"],
            destination_score=s_data["scores"]["destination_accessibility"],
            distance_score=s_data["scores"]["distance_to_transit"],
            typology=s_data["typology"],
            weakest_dimension=s_data["weakest_dimension"],
            strongest_dimension=s_data["strongest_dimension"],
            geom=point_geom
        )
        db.add(station)
        stations_seeded += 1

    # 2. Seed Tabel H3TodAnalytics (19 sel H3 per stasiun = 95 sel)
    h3_cells_seeded = 0
    for s_id, s_data in STATIONS_DATA.items():
        cells = generate_station_h3_cluster(
            station_id=s_data["id"],
            station_name=s_data["name"],
            center_lon=s_data["longitude"],
            center_lat=s_data["latitude"],
            base_tod_score=s_data["tod_readiness_score"],
            base_njop_premium=s_data["njop_premium"]["avg_njop_premium_pct"],
            typology=s_data["typology"],
            ring_count=2
        )

        for feat in cells:
            props = feat["properties"]
            geom_dict = feat["geometry"]
            geom_json_str = json.dumps(geom_dict)

            # Format WKT atau fungsi PostGIS
            # GeoAlchemy2 menerima GeoJSON string via ST_GeomFromGeoJSON
            h3_cell = H3TodAnalytics(
                h3_index=props["h3_index"],
                resolution=9,
                station_cluster=props["station_cluster"],
                density_score=props["density_score"],
                diversity_score=props["diversity_score"],
                design_score=props["design_score"],
                destination_score=props["destination_score"],
                distance_score=props["distance_score"],
                tod_readiness_score=props["tod_readiness_score"],
                typology=props["typology"],
                njop_m2=props["njop_m2"],
                predicted_njop_premium_pct=props["predicted_njop_premium_pct"],
                ci_lower_pct=props["ci_lower_pct"],
                ci_upper_pct=props["ci_upper_pct"],
                geom=f"SRID=4326;{_geojson_polygon_to_wkt(geom_dict['coordinates'][0])}"
            )
            db.add(h3_cell)
            h3_cells_seeded += 1

    db.commit()
    logger.info(f"[Seeder] Sukses melakukan seed: {stations_seeded} stasiun dan {h3_cells_seeded} sel H3.")

    return {
        "status": "success",
        "message": f"Berhasil melakukan seed ke PostGIS: {stations_seeded} stasiun dan {h3_cells_seeded} sel H3.",
        "stations_seeded": stations_seeded,
        "h3_cells_seeded": h3_cells_seeded
    }


def _geojson_polygon_to_wkt(coords: list) -> str:
    """Mengonversi array koordinat [[lon, lat], ...] ke format WKT POLYGON((lon lat, ...))."""
    pairs = [f"{pt[0]} {pt[1]}" for pt in coords]
    return f"POLYGON(({', '.join(pairs)}))"
