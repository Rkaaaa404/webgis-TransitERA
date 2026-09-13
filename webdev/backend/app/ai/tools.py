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
    },
    {
        "name": "get_survey_data",
        "description": "Mengambil dan memfilter data survei aktivitas warga MAPID (#PakSibukGa), profil ekonomi komersial (Menu Go, Struk Go), daya beli/SES, atau kondisi fasilitas di sekitar stasiun tertentu.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID simpul stasiun transit (contoh: wonokromo, gubeng, pasar_turi)."
                },
                "category": {
                    "type": "string",
                    "enum": ["economy", "pedestrian", "transit", "disamenity", "all"],
                    "description": "Kategori data survei yang ingin diambil (economy: belanja/transaksi/kuliner/bisnis, pedestrian: trotoar/zebra cross, transit: feeder/halte, disamenity: hambatan/banjir, all: semua data)."
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "get_area_score",
        "description": "Mengambil skor indikator kesiapan TOD 5D (Density, Diversity, Design/Walkability, Destination, Distance to Transit) atau metrik walkability spasial riil pada stasiun.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID simpul stasiun transit."
                },
                "metric": {
                    "type": "string",
                    "enum": ["all_5d", "walkability", "density", "diversity", "destination", "distance"],
                    "description": "Metrik spasial spesifik yang diminta."
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "get_route",
        "description": "Merencanakan dan merekomendasikan rute perjalanan transit multimoda (jalan kaki, kereta komuter, bus feeder WiraWiri / Suroboyo Bus) antara stasiun asal dan stasiun tujuan atau landmark/POI populer di Surabaya (seperti Tunjungan Plaza, Grand City, RSUD Dr Soetomo, GBT, KBS Joyoboyo, CITO, dll.).",
        "parameters": {
            "type": "object",
            "properties": {
                "origin": {
                    "type": "string",
                    "description": "ID stasiun titik awal keberangkatan (contoh: 'gubeng', 'pasar_turi', 'wonokromo', 'benowo', 'waru')."
                },
                "destination": {
                    "type": "string",
                    "description": "ID stasiun titik tujuan atau nama tempat/landmark populer di Surabaya (contoh: 'tunjungan_plaza', 'grand_city', 'gelora_bung_tomo', 'wonokromo', 'pasar_turi', 'kbs', 'royal_plaza', 'rsud_soetomo', 'cito')."
                },
                "modes": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["train", "bus", "feeder", "walk"]},
                    "description": "Pilihan moda perjalanan."
                }
            },
            "required": ["origin", "destination"]
        }
    },
    {
        "name": "get_transit_services",
        "description": "Mengambil daftar lengkap rute feeder WiraWiri, Suroboyo Bus, Trans Semanggi, dan KRL Komuter yang melewati atau terhubung di simpul stasiun tertentu di Surabaya, lengkap dengan kode rute, halte penghubung, tarif, dan jam operasional.",
        "parameters": {
            "type": "object",
            "properties": {
                "station_id": {
                    "type": "string",
                    "enum": ALL_STATION_ENUM,
                    "description": "ID simpul stasiun transit (contoh: 'benowo', 'gubeng', 'pasar_turi', 'wonokromo', 'waru')."
                }
            },
            "required": ["station_id"]
        }
    },
    {
        "name": "get_fare_and_payment_info",
        "description": "Menyediakan rincian resmi tarif transportasi massal Surabaya (Suroboyo Bus, Feeder WiraWiri, Trans Semanggi Suroboyo), aturan transfer gratis 2 jam, metode pembayaran non-tunai (QRIS & Kartu Uang Elektronik), serta penukaran botol plastik Gobis.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "enum": ["all", "fare", "free_transfer_2h", "payment_methods", "bottle_exchange"],
                    "description": "Topik tarif atau pembayaran yang ditanyakan."
                }
            }
        }
    }
]

