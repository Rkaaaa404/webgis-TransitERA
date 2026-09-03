import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TransitERA WebGIS Backend API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Secrets & External APIs
    MAPID_API_KEY: str = os.getenv("MAPID_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Surabaya Geo Bounding Box
    SURABAYA_BBOX: dict = {
        "min_lon": 112.55,
        "max_lon": 112.85,
        "min_lat": -7.38,
        "max_lat": -7.18
    }
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://*.vercel.app"
    ]

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
