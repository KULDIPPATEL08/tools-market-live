import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.init_db import init_database
from backend.app.api import (
    auth,
    sources,
    collection,
    records,
    research,
    gaps,
    datasets,
    tools,
    analytics,
    automation,
    notifications,
    ai,
    export,
    search,
    startups,
    ai_radar,
    briefings,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scoutboard")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified Intelligence Discovery, Research, Data Collection, and AI-Assisted Analysis Platform",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during local dev for seamless front/back communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
def on_startup():
    logger.info("Initializing Scoutboard database and services...")
    init_database()

# Healthcheck
@app.get("/api/health", tags=["System"])
def healthcheck():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Register all modular routers under API v1
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(sources.router, prefix=api_v1)
app.include_router(collection.router, prefix=api_v1)
app.include_router(records.router, prefix=api_v1)
app.include_router(research.router, prefix=api_v1)
app.include_router(gaps.router, prefix=api_v1)
app.include_router(datasets.router, prefix=api_v1)
app.include_router(tools.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)
app.include_router(automation.router, prefix=api_v1)
app.include_router(notifications.router, prefix=api_v1)
app.include_router(ai.router, prefix=api_v1)
app.include_router(export.router, prefix=api_v1)
app.include_router(search.router, prefix=api_v1)
app.include_router(startups.router, prefix=api_v1)
app.include_router(ai_radar.router, prefix=api_v1)
app.include_router(briefings.router, prefix=api_v1)

# Serve Frontend static assets in production if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_app(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

