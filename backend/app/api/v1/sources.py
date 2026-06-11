from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.osint import CollectionRunRead
from app.schemas.source import SourceCreate, SourceRead, SourceUpdate
from app.services.osint_pipeline import osint_pipeline
from app.services.source_registry_service import DuplicateSourceError, SourceNotFoundError, source_registry_service


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
    runs = await osint_pipeline.collect_all_sources()
    last_sync_result = SyncResult(
        status="completed",
        collected_count=sum(run.items_created for run in runs),
        synced_at=datetime.now(timezone.utc),
    )

    return last_sync_result


@router.get("/sync/status", response_model=SyncResult)
async def sync_status() -> SyncResult:
    if last_sync_result is not None:
        return last_sync_result

    return SyncResult(status="queued", collected_count=0, synced_at=datetime.now(timezone.utc))


@router.get("/runs", response_model=tuple[CollectionRunRead, ...])
async def list_collection_runs() -> tuple[CollectionRunRead, ...]:
    return osint_pipeline.list_runs()


@router.get("", response_model=tuple[SourceRead, ...])
async def list_sources(include_inactive: bool = True) -> tuple[SourceRead, ...]:
    return source_registry_service.list(include_inactive=include_inactive)


@router.post("", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
async def create_source(payload: SourceCreate) -> SourceRead:
    try:
        return source_registry_service.create(payload)
    except DuplicateSourceError as error:
        raise HTTPException(status_code=409, detail="Source already exists") from error


@router.get("/{source_id}", response_model=SourceRead)
async def get_source(source_id: UUID) -> SourceRead:
    try:
        return source_registry_service.get(source_id)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error


@router.patch("/{source_id}", response_model=SourceRead)
async def update_source(source_id: UUID, payload: SourceUpdate) -> SourceRead:
    try:
        return source_registry_service.update(source_id, payload)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error
    except DuplicateSourceError as error:
        raise HTTPException(status_code=409, detail="Source already exists") from error


@router.post("/{source_id}/collect", response_model=CollectionRunRead)
async def collect_source(source_id: UUID) -> CollectionRunRead:
    try:
        return await osint_pipeline.collect_source(source_id)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error
