ALL_STATION_ENUM = [
    "gubeng", "pasar_turi", "wonokromo", "semut", "waru",
    "tandes", "kandangan", "benowo", "ngagel", "margorejo",
    "jemursari", "kertomenanggal", "sidotopo", "kalimas", "benteng"
]

# TransitERA Spatial AI Function Calling Tool Declarations
SPATIAL_TOOLS = [
    {
        "name": "get_tod_score",
        "description": "Mengambil skor kesiapan TOD 5D, radar chart, dan tipologi kawasan pada simpul stasiun tertentu di Surabaya.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID simpul stasiun transit SRRL."
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "compare_stations",
        "description": "Membandingkan skor kesiapan TOD 5 dimensi antara dua stasiun transit.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_a": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID stasiun pertama"
                },
                "station_b": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID stasiun kedua"
                }
            },
            "required": ["station_a", "station_b"]
        }
    },
    {
        "name": "get_weakest_dimension",
        "description": "Mengidentifikasi dimensi indikator 5D TOD terlemah pada stasiun untuk rekomendasi kebijakan perbaikan infrastruktur.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID stasiun transit"
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "get_njop_premium",
        "description": "Mengambil estimasi kenaikan nilai tanah (%ΔNJOP) berbasis Spatial Durbin Model di sekitar simpul transit.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID stasiun transit"
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "filter_layer",
        "description": "Memfilter dan MENAMPILKAN titik-titik sebaran lokasi survei kuliner/warung makan ramai (Menu Go), pedagang, atau layer peta di dekat stasiun.",
        "parameters": {
            "type": "object",
            "properties": {
                "target_layer": {
                    "type": "string",
                    "enum": ["h3_tod_score", "h3_njop_premium", "survey_activity", "survey_mission_menu", "survey_mission_properti", "survey_mission_struk"],
                    "description": "Nama layer yang ingin difilter (gunakan 'survey_mission_menu' untuk warung makan/kuliner ramai)"
                },
                "kondisi": {
                    "type": "string",
                    "description": "Kondisi atau kata kunci filter (contoh: 'ramai', 'rusak')"
                }
            },
            "required": ["target_layer"]
        }
    },
    {
        "name": "simulate_scenario",
        "description": "Mensimulasikan dampak skenario perluasan koridor feeder WiraWiri/Suroboyo Bus terhadap skor TOD dan %ΔNJOP.",
        "parameters": {
            "type": "object",
            "properties": {
                "scenario_id": {
                    "type": "string",
                    "enum": ["extend_feeder_waru", "add_feeder_semut", "dedicated_pedestrian_gubeng", "pasar_turi_integration"],
                    "description": "ID skenario intervensi yang disimulasikan."
                }
            },
            "required": ["scenario_id"]
        }
    },
    {
        "name": "site_recommendation",
        "description": "Menganalisis dan merekomendasikan lokasi terbaik untuk MEMBUKA / MENDIRIKAN usaha baru (contoh: 'di mana lokasi terbaik untuk buka kedai kopi').",
        "parameters": {
            "type": "object",
            "properties": {
                "business_type": {
                    "type": "string",
                    "enum": ["coffee_shop", "warung_makan", "retail_minimarket"],
                    "description": "Jenis usaha yang ingin dibuka."
                },
                "target_station": {
                    "type": "string",
                    "enum": ["gubeng", "pasar_turi", "semut", "wonokromo", "waru"],
                    "description": "Stasiun transit terdekat untuk lokasi usaha."
                }
            },
            "required": ["business_type"]
        }
    }
]
