from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.jobs.collect_job import collect_all_sources


class SyncResult(BaseModel):
    status: str = Field(pattern="^(queued|completed)$")
    collected_count: int = Field(ge=0)
    synced_at: datetime

    model_config = ConfigDict(strict=True, frozen=True)


router = APIRouter(prefix="/api/v1/sources", tags=["sources"])
last_sync_result: SyncResult | None = None


@router.post("/sync", response_model=SyncResult)
async def trigger_sync() -> SyncResult:
    global last_sync_result
    collected = await collect_all_sources()
    last_sync_result = SyncResult(
        status="completed",
        collected_count=len(collected),
        synced_at=datetime.now(timezone.utc),
    )

    return last_sync_result


@router.get("/sync/status", response_model=SyncResult)
async def sync_status() -> SyncResult:
    if last_sync_result is not None:
        return last_sync_result

    return SyncResult(status="queued", collected_count=0, synced_at=datetime.now(timezone.utc))
