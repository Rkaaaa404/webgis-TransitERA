import pytest
from app.analytics.typology_classifier import predict_tod_typology_ml, get_model_bundle
from app.analytics.sdm_regression import SDMRegressor

def test_ml_model_bundle_properties():
    bundle = get_model_bundle()
    assert bundle is not None
    assert "scaler" in bundle
    assert "pca" in bundle
    assert "classifier" in bundle
    assert len(bundle["feature_names"]) == 5
    # PCA must explain at least 90% of spatial variance
    assert sum(bundle["explained_variance_ratio"]) >= 0.90

def test_ml_typology_prediction_commercial():
    res = predict_tod_typology_ml(
        pop_estimate=16000,
        ntl_radiance=55.0,
        feeder_halte_count=7,
        distance_to_station_km=0.15,
        flood_hazard_pct=0.0
    )
    assert res["typology"] == "Commercial Transit Hub"
    assert res["model_type"] == "PCA_RandomForest"
    assert len(res["pca_components"]) == 3
    assert res["confidence"] >= 0.70

def test_ml_typology_prediction_feeder():
    res = predict_tod_typology_ml(
        pop_estimate=4000,
        ntl_radiance=18.0,
        feeder_halte_count=0,
        distance_to_station_km=1.8,
        flood_hazard_pct=25.0
    )
    assert res["typology"] == "Low-Accessibility Feeder Zone"
    assert res["model_type"] == "PCA_RandomForest"
    assert res["confidence"] >= 0.70

def test_sdm_regressor_flood_disamenity_impact():
    sdm = SDMRegressor()
    res_clean = sdm.predict_premium(tod_score=80.0, distance_to_station_m=300.0, flood_hazard_pct=0.0)
    res_flooded = sdm.predict_premium(tod_score=80.0, distance_to_station_m=300.0, flood_hazard_pct=40.0)
    
    # Flooded area must experience environmental disamenity discount
    assert res_flooded["hazard_penalty_pct"] < 0.0
    assert res_flooded["predicted_njop_premium_pct"] < res_clean["predicted_njop_premium_pct"]
