import json
import logging
from typing import Dict, Any, Tuple
import httpx

from app.core.config import settings
from app.schemas.ai import AIQueryRequest, AIResponse, AIData
from app.ai.tools import SPATIAL_TOOLS
from app.ai.dispatcher import dispatch_spatial_function

logger = logging.getLogger(__name__)

_DUMMY_KEYS = {"", "dummy", "your_gemini_api_key_here"}

def get_gemini_url() -> str:
    model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")
    return f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SYSTEM_INSTRUCTION = (
    "Anda adalah Asisten Spasial AI cerdas untuk TransitERA WebGIS di Kota Surabaya Raya. "
    "RUANG LINGKUP KETAT: Tugas Anda EKSKLUSIF membahas transportasi massal Surabaya (SRRL, Commuter Line, Suroboyo Bus, Feeder WiraWiri), "
    "kesiapan Transit-Oriented Development (TOD 5D: Density, Diversity, Design, Destination, Distance to Transit), "
    "analisis komparasi simpul stasiun (seperti Gubeng, Pasar Turi, Wonokromo, Semut, Tandes, Kandangan, Benowo, Waru, dll.), "
    "estimasi apresiasi nilai tanah (%ΔNJOP berbasis Spatial Durbin Model), titik survei lapangan (#PakSibukGa), "
    "dan simulasi skenario intervensi antarmoda. "
    "ATURAN BATAS TOPIK (GUARDRAILS): "
    "Jika pengguna menanyakan hal di luar transportasi massal, stasiun transit, atau tata ruang Surabaya Raya "
    "(seperti resep masakan, pemrograman umum, politik umum, atau kota lain yang tidak relevan), "
    "tolak dengan sopan dalam Bahasa Indonesia dan arahkan kembali pengguna untuk menanyakan kesiapan TOD atau transportasi transit di Surabaya. "
    "PANDUAN PEMANGGILAN FUNGSI (FUNCTION CALLING): "
    "- Jika pengguna meminta menampilkan atau memfilter lokasi titik survei/warung makan ramai di dekat stasiun, panggil 'filter_layer' (target_layer='survey_mission_menu', kondisi='ramai'). "
    "- Jika pengguna menanyakan rekomendasi lokasi terbaik untuk MEMBUKA / MENDIRIKAN usaha/kedai kopi baru, panggil 'site_recommendation'. "
    "- Jika menanyakan dimensi terlemah, panggil 'get_weakest_dimension'. "
    "- Jika menanyakan kenaikan nilai tanah / NJOP, panggil 'get_njop_premium'. "
    "- Jika menanyakan perbandingan 2 stasiun, panggil 'compare_stations'. "
    "- Jika menanyakan simulasi atau perluasan feeder, panggil 'simulate_scenario'. "
    "- Jika menanyakan skor TOD atau info stasiun umum, panggil 'get_tod_score'."
)

ALL_STATION_SLUGS = [
    "gubeng", "pasar_turi", "wonokromo", "semut", "tandes", 
    "kandangan", "benowo", "ngagel", "margorejo", "jemursari", 
    "kertomenanggal", "waru", "sidotopo", "kalimas", "benteng"
]

def _parse_station_from_prompt(p: str) -> str:
    """Mengekstrak station_id dari prompt secara case-insensitive."""
    p_clean = p.lower().replace("-", " ")
    for s in ALL_STATION_SLUGS:
        s_clean = s.replace("_", " ")
        if s in p_clean or s_clean in p_clean:
            return s
    return "gubeng"


def match_fallback_intent(prompt: str) -> Tuple[str, Dict[str, Any]]:
    """
    Rule-based intent router — dipakai saat Gemini API tidak tersedia.
    Urutan pencocokan penting: lebih spesifik dulu.
    """
    p = prompt.lower()

    # 1. Compare stations
    if ("bandingkan" in p or "compare" in p) and any(
        s.replace("_", " ") in p for s in ALL_STATION_SLUGS
    ):
        found = [
            s for s in ALL_STATION_SLUGS
            if s in p or s.replace("_", " ") in p
        ]
        st_a = found[0] if len(found) > 0 else "gubeng"
        st_b = found[1] if len(found) > 1 else "wonokromo"
        return "compare_stations", {"station_a": st_a, "station_b": st_b}

    # 2. Filter layer / warung makan ramai / kuliner
    if any(kw in p for kw in ["warung makan ramai", "warung ramai", "menu", "kuliner", "filter", "tampilkan lokasi warung"]):
        return "filter_layer", {"target_layer": "survey_mission_menu", "kondisi": "ramai"}

    # 3. Site recommendation / Rekomendasi lokasi usaha
    if any(kw in p for kw in ["lokasi terbaik", "rekomendasi lokasi", "buka kedai", "buka warung", "kedai kopi"]):
        biz = "coffee_shop" if ("kopi" in p or "coffee" in p) else "warung_makan"
        return "site_recommendation", {"business_type": biz, "target_station": _parse_station_from_prompt(p)}

    # 4. Weakest dimension
    if any(kw in p for kw in ["terlemah", "dimensi terlemah", "weakest", "kekurangan"]):
        return "get_weakest_dimension", {"station_id": _parse_station_from_prompt(p)}

    # 5. NJOP Premium / Kenaikan nilai tanah
    if any(kw in p for kw in ["njop", "nilai tanah", "kenaikan", "premium", "lahan"]):
        return "get_njop_premium", {"station_id": _parse_station_from_prompt(p)}

    # 6. Simulate scenario / Feeder
    if any(kw in p for kw in ["feeder", "perpanjang", "simulasi", "jika", "skenario", "what-if"]):
        return "simulate_scenario", {"scenario_id": "extend_feeder_waru"}

    # 7. TOD score (generic)
    if any(kw in p for kw in ["skor tod", "tod score", "kesiapan tod", "skor", "tampilkan"]):
        return "get_tod_score", {"station_id": _parse_station_from_prompt(p)}

    # 8. Station name mentioned directly
    for s in ALL_STATION_SLUGS:
        if s in p or s.replace("_", " ") in p:
            return "get_tod_score", {"station_id": s}

    return "default", {}


async def process_ai_query(request: AIQueryRequest) -> AIResponse:
    """
    Memproses kueri bahasa alami dari pengguna menggunakan Gemini API Function Calling.
    Fallback otomatis ke rule-based intent router jika:
      - API key belum diset / masih dummy
      - Gemini API error / timeout
    """
    api_key = settings.GEMINI_API_KEY
    prompt = request.prompt.strip()

    # Coba Gemini jika key valid (bukan dummy)
    if api_key and api_key not in _DUMMY_KEYS:
        try:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
                "tools": [{"function_declarations": SPATIAL_TOOLS}],
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{get_gemini_url()}?key={api_key}",
                    json=payload,
                )

            if resp.status_code == 200:
                result = resp.json()
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text_parts = []
                    for part in parts:
                        if "functionCall" in part:
                            fn = part["functionCall"]
                            fn_name = fn.get("name", "default")
                            fn_args = fn.get("args", {})
                            logger.info(f"Gemini function call: {fn_name}({fn_args})")
                            ai_data = dispatch_spatial_function(fn_name, fn_args)
                            return AIResponse(status="success", data=ai_data)
                        elif "text" in part:
                            text_parts.append(part["text"])

                    # Jika model mengembalikan respon teks, tetap set visual action yang relevan
                    if text_parts:
                        combined_text = "\n".join(text_parts).strip()
                        fn_name, fn_args = match_fallback_intent(prompt)
                        ai_data = dispatch_spatial_function(fn_name, fn_args)
                        # Gunakan teks kaya dari Gemini jika tidak menolak topik
                        if len(combined_text) > 30:
                            ai_data.text_response = combined_text
                        return AIResponse(status="success", data=ai_data)
            else:
                logger.warning(
                    f"Gemini API returned {resp.status_code}: {resp.text[:200]}"
                )
        except Exception as e:
            logger.warning(f"Gemini API unreachable, falling back to rule-based router: {e}")
    else:
        logger.debug("Gemini API key not configured — using rule-based fallback router.")

    # Rule-based fallback
    fn_name, fn_args = match_fallback_intent(prompt)
    ai_data = dispatch_spatial_function(fn_name, fn_args)
    return AIResponse(status="success", data=ai_data)
