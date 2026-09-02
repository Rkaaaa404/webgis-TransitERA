from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Optional, Dict, Any
import numpy as np

from app.schemas.tod import (
    StationId,
    StationSummary,
    StationTODScoreResponse,
    NJOPPremiumResponse,
    ScenarioSimulationRequest,
    ScenarioSimulationResponse,
    TODDimensionScores,
    AHPCalculationRequest,
    AHPCalculationResponse,
    SDMEstimateRequest,
    SDMEstimateResponse,
    TypologyRequest,
    TypologyResponse,
)
from app.schemas.ai import AIQueryRequest, AIResponse
from app.data.stations_data import STATIONS_DATA, get_all_h3_features, get_all_survey_features
from app.data.mapid_client import fetch_survey_geojson
from app.ai.gemini_proxy import process_ai_query
from app.core.config import settings
from app.spatial.ahp import calculate_ahp_weights, calculate_tod_score, DEFAULT_5D_PAIRWISE_MATRIX
from app.analytics.sdm_regression import SDMRegressor
from app.spatial.h3_grid import (
    classify_tod_typology,
    get_station_h3_cell,
    get_h3_disk,
    get_h3_distance,
)

router = APIRouter()
sdm_engine = SDMRegressor()

# Surabaya Raya bounding box — dari PRD SEC-4
_BBOX = settings.SURABAYA_BBOX


def _validate_surabaya_bbox(lat: float, lon: float) -> None:
    """Tolak koordinat di luar wilayah studi Surabaya Raya."""
    if not (
        _BBOX["min_lat"] <= lat <= _BBOX["max_lat"]
        and _BBOX["min_lon"] <= lon <= _BBOX["max_lon"]
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Koordinat ({lat}, {lon}) di luar bounding box Surabaya Raya "
                f"({_BBOX['min_lon']}–{_BBOX['max_lon']} BT, "
                f"{_BBOX['min_lat']}–{_BBOX['max_lat']} LS)."
            ),
        )


# ---------------------------------------------------------------------------
# Station endpoints
# ---------------------------------------------------------------------------

@router.get("/stations", response_model=List[StationSummary])
async def list_stations():
    """Mengambil ringkasan 5 simpul stasiun transit utama SRRL Surabaya."""
    return [
        StationSummary(
            id=s["id"],
            name=s["name"],
            latitude=s["latitude"],
            longitude=s["longitude"],
            tod_readiness_score=s["tod_readiness_score"],
            typology=s["typology"],
            weakest_dimension=s["weakest_dimension"],
            strongest_dimension=s["strongest_dimension"],
            status=s["status"],
        )
        for s in STATIONS_DATA.values()
    ]


@router.get("/tod-score/{station_id}", response_model=StationTODScoreResponse)
async def get_station_tod_score(station_id: StationId):
    """Mengambil detail skor 5D TOD, benchmark koridor, dan rekomendasi per stasiun."""
    data = STATIONS_DATA.get(station_id.value)
    if not data:
        raise HTTPException(status_code=404, detail=f"Stasiun '{station_id}' tidak ditemukan")

    center_cell = get_station_h3_cell(data["latitude"], data["longitude"], resolution=9)
    station_h3_indexes = sorted(
        get_h3_disk(center_cell, k=2),
        key=lambda c: (get_h3_distance(center_cell, c), c)
    )

    return StationTODScoreResponse(
        station_id=data["id"],
        station_name=data["name"],
        tod_readiness_score=data["tod_readiness_score"],
        scores=TODDimensionScores(**data["scores"]),
        benchmark_scores=TODDimensionScores(**data["benchmark_scores"]),
        typology=data["typology"],
        weakest_dimension=data["weakest_dimension"],
        strongest_dimension=data["strongest_dimension"],
        h3_indexes=station_h3_indexes,
        policy_recommendations=data["policy_recommendations"],
    )


# ---------------------------------------------------------------------------
# Spatial / H3 Grid endpoint
# ---------------------------------------------------------------------------

@router.get("/h3-grid")
async def get_h3_grid(
    station: Optional[str] = Query(None, description="Filter by station ID"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum TOD score filter"),
):
    """
    Mengambil GeoJSON FeatureCollection sel H3 (resolusi 9) dengan skor 5D TOD & NJOP.
    Dihasilkan secara deterministik dari STATIONS_DATA.
    """
    geo_data = get_all_h3_features()
    features = geo_data["features"]

    if station:
        features = [
            f for f in features
            if f["properties"]["station_cluster"] == station.lower()
        ]
    if min_score is not None:
        features = [
            f for f in features
            if f["properties"]["tod_readiness_score"] >= min_score
        ]

    return {"type": "FeatureCollection", "features": features}


# ---------------------------------------------------------------------------
# NJOP Premium endpoint
# ---------------------------------------------------------------------------

@router.get("/njop-premium/{station_id}", response_model=NJOPPremiumResponse)
async def get_njop_premium(station_id: StationId):
    """Mengambil estimasi premium nilai lahan (%ΔNJOP) berbasis Spatial Durbin Model."""
    data = STATIONS_DATA.get(station_id.value)
    if not data:
        raise HTTPException(status_code=404, detail="Stasiun tidak ditemukan")

    njop = data["njop_premium"]
    return NJOPPremiumResponse(
        station_id=data["id"],
        station_name=data["name"],
        avg_njop_premium_pct=njop["avg_njop_premium_pct"],
        ci_lower_pct=njop["ci_lower_pct"],
        ci_upper_pct=njop["ci_upper_pct"],
        affected_h3_count=njop["affected_h3_count"],
        r_squared=njop["r_squared"],
        direct_effect_pct=njop["direct_effect_pct"],
        spillover_effect_pct=njop["spillover_effect_pct"],
    )


# ---------------------------------------------------------------------------
# Dynamic Spatial Analytics API (AHP, SDM Regression, Typology Classification)
# ---------------------------------------------------------------------------

@router.post("/analytics/ahp", response_model=AHPCalculationResponse)
async def calculate_ahp_endpoint(req: AHPCalculationRequest):
    """
    Menghitung composite TOD Readiness Score (0-100) menggunakan Analytic Hierarchy Process (AHP)
    berdasarkan principal eigenvector dan memvalidasi Consistency Ratio (CR <= 0.10).
    """
    if req.pairwise_matrix:
        matrix = np.array(req.pairwise_matrix)
        if matrix.shape != (5, 5):
            raise HTTPException(status_code=400, detail="Pairwise matrix harus berukuran 5x5.")
    else:
        matrix = DEFAULT_5D_PAIRWISE_MATRIX

    weights_vec, cr = calculate_ahp_weights(matrix)
    dim_keys = ["density", "diversity", "design", "destination_accessibility", "distance_to_transit"]
    weights_dict = {dim_keys[i]: round(float(weights_vec[i]), 4) for i in range(5)}

    scores_dict = req.scores.model_dump()
    tod_score = calculate_tod_score(scores_dict, weights_vec)

    # Temukan dimensi terlemah dan terkuat
    sorted_dims = sorted(scores_dict.items(), key=lambda x: x[1])
    weakest_dim = sorted_dims[0][0].replace("_", " ").title()
    strongest_dim = sorted_dims[-1][0].replace("_", " ").title()

    status = (
        "Sangat Siap (Tier 1)" if tod_score >= 80
        else "Siap (Tier 2)" if tod_score >= 70
        else "Cukup Siap (Tier 2)" if tod_score >= 60
        else "Butuh Peningkatan (Tier 3)"
    )

    recommendations = [
        f"Prioritaskan alokasi APBD untuk memperkuat dimensi {weakest_dim} yang saat ini terendah ({sorted_dims[0][1]}/100).",
        f"Maksimalkan keunggulan {strongest_dim} ({sorted_dims[-1][1]}/100) sebagai daya tarik utama kawasan transit.",
        "Integrasikan rute pengumpan mikromobilitas dalam radius 400m stasiun."
    ]

    return AHPCalculationResponse(
        tod_readiness_score=round(tod_score, 1),
        status=status,
        consistency_ratio=round(cr, 4),
        is_consistent=cr <= 0.10,
        weights=weights_dict,
        weakest_dimension=weakest_dim,
        strongest_dimension=strongest_dim,
        policy_recommendations=recommendations
    )


@router.post("/analytics/sdm-estimate", response_model=SDMEstimateResponse)
async def estimate_sdm_endpoint(req: SDMEstimateRequest):
    """
    Menghitung estimasi kenaikan nilai tanah (%ΔNJOP) berbasis Spatial Durbin Model (SDM)
    dengan dekomposisi Direct Effect, Spillover Effect, dan 95% Confidence Interval.
    """
    result = sdm_engine.predict_premium(
        tod_score=req.tod_score,
        distance_to_station_m=req.distance_to_station_m,
        neighbor_avg_tod=req.neighbor_avg_tod
    )
    return SDMEstimateResponse(**result)


@router.post("/analytics/typology", response_model=TypologyResponse)
async def classify_typology_endpoint(req: TypologyRequest):
    """
    Mengklasifikasikan tipologi kawasan TOD (Commercial Transit Hub, Mixed-Use Heritage,
    Mixed-Use Residential, Low-Accessibility Feeder) berbasis indikator spasial 5D.
    """
    scores_dict = req.scores.model_dump()
    if req.tod_readiness_score is not None:
        scores_dict["tod_readiness_score"] = req.tod_readiness_score

    result = classify_tod_typology(scores_dict)
    return TypologyResponse(**result)


# ---------------------------------------------------------------------------
# Survey Points endpoint
# ---------------------------------------------------------------------------

_SURABAYA_POLYGON = [[
    [_BBOX["min_lon"], _BBOX["min_lat"]],
    [_BBOX["max_lon"], _BBOX["min_lat"]],
    [_BBOX["max_lon"], _BBOX["max_lat"]],
    [_BBOX["min_lon"], _BBOX["max_lat"]],
    [_BBOX["min_lon"], _BBOX["min_lat"]],
]]


@router.get("/survey-points")
async def get_survey_points(
    survey_type: Optional[str] = Query(None, description="activity | mission"),
    mission_subtype: Optional[str] = Query(None, description="properti_go | struk_go | menu_go"),
    station: Optional[str] = Query(None, description="Filter by station cluster ID"),
):
    """
    Mengambil GeoJSON titik hasil survei lapangan `#PakSibukGa` dari GEO MAPID REST API.
    Jika API tidak tersedia atau MAPID_API_KEY belum diset, menggunakan data lokal.
    """
    data = fetch_survey_geojson(polygon_coords=_SURABAYA_POLYGON, hashtag="PakSibukGa")
    features = data.get("features", [])

    if survey_type:
        features = [
            f for f in features
            if f.get("properties", {}).get("survey_type") == survey_type
        ]
    if mission_subtype:
        features = [
            f for f in features
            if f.get("properties", {}).get("mission_subtype") == mission_subtype
        ]
    if station:
        features = [
            f for f in features
            if f.get("properties", {}).get("station_cluster") == station.lower()
        ]

    return {"type": "FeatureCollection", "features": features}


# ---------------------------------------------------------------------------
# Scenario Simulation endpoint
# ---------------------------------------------------------------------------

_SCENARIO_IMPACTS = {
    "feeder_extension": {
        "delta_tod": 7.5,
        "delta_njop": 3.2,
        "dimension_impacts": {
            "distance_to_transit": 12.0,
            "destination_accessibility": 6.5,
            "diversity": 4.0,
            "design": 8.5,
            "density": 2.0,
        },
    },
    "pedestrian_upgrade": {
        "delta_tod": 5.2,
        "delta_njop": 2.1,
        "dimension_impacts": {
            "design": 18.0,
            "destination_accessibility": 5.0,
            "diversity": 2.5,
            "density": 1.5,
            "distance_to_transit": 3.0,
        },
    },
    "mixed_use_rezoning": {
        "delta_tod": 6.1,
        "delta_njop": 4.3,
        "dimension_impacts": {
            "diversity": 15.0,
            "density": 8.0,
            "destination_accessibility": 7.0,
            "design": 4.0,
            "distance_to_transit": 2.0,
        },
    },
}


@router.post("/simulate", response_model=ScenarioSimulationResponse)
async def simulate_scenario(request: ScenarioSimulationRequest):
    """Mensimulasikan skenario intervensi what-if terhadap skor TOD dan %ΔNJOP."""
    st_data = STATIONS_DATA.get(request.target_station.value, STATIONS_DATA["waru"])
    base_score = st_data["tod_readiness_score"]
    base_njop = st_data["njop_premium"]["avg_njop_premium_pct"]

    impact = _SCENARIO_IMPACTS.get(
        request.intervention_type,
        _SCENARIO_IMPACTS["feeder_extension"]
    )
    delta_score = impact["delta_tod"]
    delta_njop = impact["delta_njop"]

    return ScenarioSimulationResponse(
        scenario_id=request.scenario_id,
        target_station=request.target_station,
        baseline_tod_score=base_score,
        simulated_tod_score=round(base_score + delta_score, 1),
        delta_tod_score=delta_score,
        baseline_njop_premium_pct=base_njop,
        simulated_njop_premium_pct=round(base_njop + delta_njop, 1),
        delta_njop_premium_pct=delta_njop,
        dimension_impacts=impact["dimension_impacts"],
        summary_narrative=(
            f"Intervensi *{request.intervention_type.replace('_', ' ')}* pada simpul "
            f"**{st_data['name']}** meningkatkan kesiapan TOD dari {base_score} ke "
            f"{round(base_score + delta_score, 1)} (+{delta_score} poin) dan mendorong "
            f"tambahan apresiasi nilai lahan sebesar +{delta_njop}% (%ΔNJOP)."
        ),
    )


# ---------------------------------------------------------------------------
# AI Query endpoint
# ---------------------------------------------------------------------------

@router.post("/ai/query", response_model=AIResponse)
async def ai_query(request: AIQueryRequest):
    """Proxy endpoint Asisten Spasial AI (Google Gemini via JSON Function Calling)."""
    return await process_ai_query(request)
