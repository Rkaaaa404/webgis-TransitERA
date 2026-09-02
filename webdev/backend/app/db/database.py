import os
import logging
from typing import Generator, Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.db.models import Base

logger = logging.getLogger(__name__)

# Baca DATABASE_URL dari config / environment
DATABASE_URL = os.getenv("DATABASE_URL", getattr(settings, "DATABASE_URL", ""))

# Normalisasi protokol postgres:// ke postgresql:// untuk SQLAlchemy compatibility (standar Supabase/Heroku)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = None
SessionLocal = None
_db_connected = False


def init_db_engine():
    global engine, SessionLocal, _db_connected
    if not DATABASE_URL:
        logger.info("[Database] DATABASE_URL tidak diset. Backend beroperasi dalam mode In-Memory (Graceful Fallback).")
        _db_connected = False
        return

    try:
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 5}
        )
        # Test koneksi kilat
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _db_connected = True
        logger.info("[Database] Sukses terkoneksi ke PostgreSQL/PostGIS database.")
    except Exception as e:
        logger.warning(
            f"[Database] Gagal terhubung ke database ({e}). "
            f"Beralih otomatis ke mode In-Memory (Graceful Fallback)."
        )
        engine = None
        SessionLocal = None
        _db_connected = False


# Inisialisasi awal saat import module
init_db_engine()


def is_db_connected() -> bool:
    """Mengembalikan True jika database PostgreSQL/PostGIS aktif dan dapat diakses."""
    return _db_connected


def get_db() -> Generator[Optional[Session], None, None]:
    """
    FastAPI dependency untuk mendapatkan Session database.
    Jika database tidak aktif / fallback, menghasilkan None dengan aman.
    """
    if not is_db_connected() or SessionLocal is None:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> Dict[str, Any]:
    """Pemeriksaan status kesehatan koneksi database untuk /health endpoint."""
    if not is_db_connected() or engine is None:
        return {
            "status": "offline_fallback",
            "storage_mode": "in_memory",
            "message": "Beroperasi menggunakan in-memory cache data stasiun dan grid H3."
        }

    try:
        with engine.connect() as conn:
            # Periksa ekstensi postgis
            res = conn.execute(text("SELECT postgis_version()")).scalar()
            return {
                "status": "connected",
                "storage_mode": "postgis_live",
                "postgis_version": res,
                "message": "Terhubung penuh ke database spasial PostGIS."
            }
    except Exception as e:
        return {
            "status": "degraded",
            "storage_mode": "in_memory_fallback",
            "error": str(e)
        }
