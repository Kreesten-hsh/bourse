from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.health import router as v1_health_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.opportunities import router as opportunities_router
from app.api.v1.pipeline import router as pipeline_router
from app.api.v1.saved import router as saved_router
from app.api.v1.sources import router as sources_router
from app.core.config import get_settings
from app.core.database import init_db
from app.jobs.scheduler import create_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage
    await init_db()
    
    scheduler = create_scheduler()
    scheduler.start()
    app.state.scheduler = scheduler
    
    yield
    # Arrêt
    scheduler.shutdown()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS", "DELETE"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(v1_health_router)
    app.include_router(opportunities_router)
    app.include_router(sources_router)
    app.include_router(pipeline_router)
    app.include_router(notifications_router)
    app.include_router(saved_router)
    return app


app = create_app()
