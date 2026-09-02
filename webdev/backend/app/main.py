from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.endpoints import router as api_router

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.db.database import check_db_health

app = FastAPI(
    title="TransitERA API",
    description="Backend Spatial Analytics Engine for TransitERA WebGIS",
    version="1.0.0"
)

# Setup Rate Limiter (SEC-I1)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3030",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3030",
        "https://transitera.mapid.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single canonical router with /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to TransitERA Backend API. Spatial H3 Engine is running."}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "TransitERA API",
        "database": check_db_health()
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
