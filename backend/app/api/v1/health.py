from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict

from app.core.config import get_settings


class HealthResponse(BaseModel):
    service: str
    version: str
    environment: str
    status: Literal["ok"]

    model_config = ConfigDict(strict=True, frozen=True)


router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()

    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        status="ok",
    )
