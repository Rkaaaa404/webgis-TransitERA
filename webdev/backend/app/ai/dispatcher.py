from typing import Dict, Any
from app.data.stations_data import STATIONS_DATA, get_weakest_dimension_score
from app.schemas.ai import AIData, ViewState, ChartPayload

# Mapping dari dimension name → key di scores dict
_DIM_KEY_MAP: Dict[str, str] = {
    "Density": "density",
    "Diversity": "diversity",
    "Design": "design",
    "Destination Accessibility": "destination_accessibility",
    "Distance to Transit": "distance_to_transit",
}


def dispatch_spatial_function(func_name: str, args: Dict[str, Any]) -> AIData:
    """
    Mengeksekusi nama tool yang dipilih Gemini dan membangun dual-output payload.
    Setiap function handler mengembalikan:
      - json_response → AIData dengan action & view_state (untuk manipulasi peta)
      - text_response → Narasi analitik human-readable
    """
    if func_name == "get_tod_score":
        st_id = args.get("station_id", "gubeng").lower()
        station = STATIONS_DATA.get(st_id, STATIONS_DATA["gubeng"])
        weakest_score = get_weakest_dimension_score(station)
        strongest_key = _DIM_KEY_MAP.get(station["strongest_dimension"], "destination_accessibility")
        strongest_score = station["scores"].get(strongest_key, 0.0)

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_tod_score",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5,
                pitch=30.0
            ),
            filter_query={"station_id": st_id},
            chart_payload=ChartPayload(
                type="radar_5d",
                title=f"Analisis 5D TOD — {station['name']}",
                data={
                    "station_name": station["name"],
                    "scores": station["scores"],
                    "benchmark": station["benchmark_scores"],
                    "tod_readiness_score": station["tod_readiness_score"]
                }
            ),
            text_response=(
                f"Kawasan **{station['name']}** memiliki **TOD Readiness Score {station['tod_readiness_score']}** "
                f"({station['status']}) dengan tipologi **{station['typology']}**. "
                f"Dimensi terkuat adalah *{station['strongest_dimension']}* ({strongest_score:.1f}/100), "
                f"sementara dimensi terlemah adalah *{station['weakest_dimension']}* ({weakest_score:.1f}/100). "
                f"Rekomendasi: {station['policy_recommendations'][0]}"
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "compare_stations":
        st_a = args.get("station_a", "gubeng").lower()
        st_b = args.get("station_b", "wonokromo").lower()
        data_a = STATIONS_DATA.get(st_a, STATIONS_DATA["gubeng"])
        data_b = STATIONS_DATA.get(st_b, STATIONS_DATA["wonokromo"])

        mid_lon = round((data_a["longitude"] + data_b["longitude"]) / 2, 6)
        mid_lat = round((data_a["latitude"] + data_b["latitude"]) / 2, 6)
        delta = round(data_a["tod_readiness_score"] - data_b["tod_readiness_score"], 1)
        higher = data_a["name"] if delta >= 0 else data_b["name"]

        return AIData(
            action="compare_stations",
            target_layer="h3_tod_score",
            target_station=st_a,
            view_state=ViewState(center=[mid_lon, mid_lat], zoom=12.5),
            chart_payload=ChartPayload(
                type="radar_comparison",
                title=f"Komparasi: {data_a['name']} vs {data_b['name']}",
                data={
                    "station_a": {
                        "name": data_a["name"],
                        "scores": data_a["scores"],
                        "overall": data_a["tod_readiness_score"]
                    },
                    "station_b": {
                        "name": data_b["name"],
                        "scores": data_b["scores"],
                        "overall": data_b["tod_readiness_score"]
                    }
                }
            ),
            text_response=(
                f"Perbandingan 5D TOD: **{data_a['name']}** meraih skor **{data_a['tod_readiness_score']}**, "
                f"sedangkan **{data_b['name']}** meraih skor **{data_b['tod_readiness_score']}** "
                f"(selisih {abs(delta)} poin). **{higher}** lebih unggul pada aspek konektivitas dan "
                f"percampuran guna lahan komersial. Dimensi *Design* (jalur pedestrian) menjadi "
                f"faktor yang paling membutuhkan alokasi intervensi di kedua simpul."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_weakest_dimension":
        st_id = args.get("station_id", "pasar_turi").lower()
        station = STATIONS_DATA.get(st_id, STATIONS_DATA["pasar_turi"])
        weakest_name = station["weakest_dimension"]
        weakest_score = get_weakest_dimension_score(station)
        weakest_benchmark_key = _DIM_KEY_MAP.get(weakest_name, "design")
        benchmark_score = station["benchmark_scores"].get(weakest_benchmark_key, 0.0)

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_tod_score",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.5
            ),
            text_response=(
                f"Dimensi TOD terlemah di **{station['name']}** adalah **{weakest_name}** "
                f"dengan skor hanya **{weakest_score:.1f} / 100** "
                f"(di bawah rata-rata koridor {benchmark_score:.1f}). "
                f"Penyebab utama berdasarkan data survei lapangan adalah kualitas infrastruktur "
                f"pejalan kaki yang belum merata dan minimnya fasilitas pendukung. "
                f"Prioritas intervensi: {station['policy_recommendations'][0]}"
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "get_njop_premium":
        st_id = args.get("station_id", "waru").lower()
        station = STATIONS_DATA.get(st_id, STATIONS_DATA["waru"])
        njop = station["njop_premium"]

        return AIData(
            action="highlight_and_zoom",
            target_layer="h3_njop_premium",
            target_station=st_id,
            view_state=ViewState(
                center=[station["longitude"], station["latitude"]],
                zoom=14.2
            ),
            filter_query={"station_id": st_id, "layer": "njop_premium"},
            chart_payload=ChartPayload(
                type="njop_premium_stats",
                title=f"Estimasi Premium NJOP — {station['name']}",
                data=njop
            ),
            text_response=(
                f"Berdasarkan Spatial Durbin Model, simpul transit di sekitar **{station['name']}** "
                f"diestimasikan berasosiasi dengan kenaikan nilai tanah (**%ΔNJOP**) rata-rata "
                f"**+{njop['avg_njop_premium_pct']}%** "
                f"(Interval Kepercayaan 95%: **{njop['ci_lower_pct']}% s.d. {njop['ci_upper_pct']}%**). "
                f"Dampak langsung lokal: +{njop['direct_effect_pct']}%, "
                f"limpahan spasial (*spillover*): +{njop['spillover_effect_pct']}%."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "filter_layer":
        layer = args.get("target_layer", "survey_mission_menu")
        kondisi = args.get("kondisi", "ramai")

        return AIData(
            action="filter_layer",
            target_layer=layer,
            view_state=ViewState(center=[112.7521, -7.2654], zoom=13.0),
            filter_query={"layer": layer, "condition": kondisi},
            text_response=(
                f"Menampilkan filter layer **{layer}** dengan kriteria **'{kondisi}'**. "
                f"Peta telah disesuaikan untuk menampilkan sebaran merchant kuliner Menu Go "
                f"yang memiliki tingkat keramaian tinggi di sekitar koridor stasiun SRRL Surabaya."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "simulate_scenario":
        sc_id = args.get("scenario_id", "extend_feeder_waru")

        return AIData(
            action="show_scenario",
            target_layer="h3_tod_score",
            target_station="waru",
            view_state=ViewState(center=[112.7297, -7.3519], zoom=14.0),
            chart_payload=ChartPayload(
                type="scenario_impact",
                title="Simulasi Intervensi Feeder Waru",
                data={
                    "baseline_score": 68.3,
                    "simulated_score": 75.8,
                    "delta_score": 7.5,
                    "baseline_njop": 8.2,
                    "simulated_njop": 11.4,
                    "delta_njop": 3.2
                }
            ),
            text_response=(
                f"Simulasi skenario **Perluasan Feeder WiraWiri ke Stasiun Waru** "
                f"menunjukkan peningkatan TOD Readiness Score dari **68,3 menjadi 75,8 (+7,5 poin)**. "
                f"Dimensi *Distance to Transit* dan *Diversity* mengalami kenaikan paling signifikan. "
                f"Estimasi %ΔNJOP diproyeksikan dari 8,2% menjadi **11,4% (+3,2% apresiasi tambahan)**."
            ),
            function_called=func_name,
            function_args=args
        )

    elif func_name == "site_recommendation":
        biz = args.get("business_type", "coffee_shop")
        biz_label = biz.replace("_", " ").title()

        return AIData(
            action="site_recommendation",
            target_layer="survey_mission_menu",
            target_station="wonokromo",
            view_state=ViewState(center=[112.7383, -7.3014], zoom=14.5),
            chart_payload=ChartPayload(
                type="spending_cluster",
                title="Profil Daya Beli & Keramaian",
                data={
                    "recommended_station": "Stasiun Wonokromo",
                    "h3_index": "898d80824cbffff",
                    "avg_spending": 38500,
                    "market_density": "Tinggi",
                    "competitor_count": 4
                }
            ),
            text_response=(
                f"Untuk membuka usaha **{biz_label}**, lokasi terbaik adalah sekitar "
                f"**Stasiun Wonokromo (Grid Sel H3: 898d80824cbffff)** radius 250m dari pintu utara. "
                f"Rata-rata transaksi Struk Go Rp 38.500/orang, percampuran guna lahan komersial aktif, "
                f"dan tingginya pergerakan komuter harian meminimalkan risiko *tenant mismatch*."
            ),
            function_called=func_name,
            function_args=args
        )

    # Default fallback
    return AIData(
        action="default_narrative",
        text_response=(
            "Halo! Saya Asisten Spasial TransitERA. Anda dapat menanyakan: "
            "kesiapan TOD di 5 stasiun SRRL Surabaya, membandingkan stasiun, "
            "mengestimasi kenaikan nilai tanah (%ΔNJOP), atau mensimulasikan skenario rute feeder. "
            "Coba: *\"Tampilkan skor TOD di sekitar Stasiun Gubeng\"*"
        )
    )
