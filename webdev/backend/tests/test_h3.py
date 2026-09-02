import pytest
import h3
from app.spatial.h3_grid import (
    get_station_h3_cell,
    get_h3_disk,
    get_h3_distance,
    get_h3_boundary_geojson,
    generate_station_h3_cluster,
)
from app.data.stations_data import STATIONS_DATA

def is_valid_h3(cell: str) -> bool:
    if hasattr(h3, "is_valid_cell"):
        return h3.is_valid_cell(cell)
    return h3.h3_is_valid(cell)

def get_resolution(cell: str) -> int:
    if hasattr(h3, "get_resolution"):
        return h3.get_resolution(cell)
    return h3.h3_get_resolution(cell)

def test_station_center_cells_are_valid_res9():
    for st_id, data in STATIONS_DATA.items():
        cell = get_station_h3_cell(data["latitude"], data["longitude"], resolution=9)
        assert is_valid_h3(cell), f"Cell {cell} for {st_id} must be a valid H3 index"
        assert get_resolution(cell) == 9, f"Cell {cell} must have resolution 9"

def test_h3_cluster_generates_19_genuine_hexagons():
    gubeng = STATIONS_DATA["gubeng"]
    cluster = generate_station_h3_cluster(
        station_id="gubeng",
        station_name=gubeng["name"],
        center_lon=gubeng["longitude"],
        center_lat=gubeng["latitude"],
        base_tod_score=gubeng["tod_readiness_score"],
        base_njop_premium=gubeng["njop_premium"]["avg_njop_premium_pct"],
        typology=gubeng["typology"],
        ring_count=2
    )

    assert len(cluster) == 19, "k=2 ring must produce 19 cells (1 center + 6 ring 1 + 12 ring 2)"

    for feat in cluster:
        cell_id = feat["id"]
        assert is_valid_h3(cell_id), f"{cell_id} must be a valid H3 cell"
        assert get_resolution(cell_id) == 9, f"{cell_id} must be resolution 9"

        # Check geometry is a closed polygon with 7 points (6 vertices + 1 repeat)
        coords = feat["geometry"]["coordinates"][0]
        assert len(coords) == 7
        assert coords[0] == coords[-1], "Polygon must be closed"

        # Coordinates must be within Surabaya longitude/latitude bounds
        for lon, lat in coords:
            assert 112.5 <= lon <= 112.9, f"Lon {lon} outside Surabaya"
            assert -7.45 <= lat <= -7.15, f"Lat {lat} outside Surabaya"

        props = feat["properties"]
        assert 0 <= props["tod_readiness_score"] <= 100
        assert props["ring_distance"] in [0, 1, 2]
