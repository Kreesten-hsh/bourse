from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.collection_run import CollectionRun
from app.schemas.osint import CollectionRunRead, CollectionRunStatus
from app.schemas.source import SourceCreate, SourceRead, SourceUpdate
from app.services.osint_pipeline import osint_pipeline
from app.services.source_registry_service import DuplicateSourceError, SourceNotFoundError, source_registry_service


class SyncResult(BaseModel):
    status: str = Field(pattern="^(queued|completed)$")
    collected_count: int = Field(ge=0)
    synced_at: datetime

    model_config = ConfigDict(strict=True, frozen=True)


router = APIRouter(prefix="/api/v1/sources", tags=["sources"])


@router.post("/sync", response_model=SyncResult)
async def trigger_sync(db: AsyncSession = Depends(get_db)) -> SyncResult:
    runs = await osint_pipeline.collect_all_sources(db)
    return SyncResult(
        status="completed",
        collected_count=sum(run.items_created for run in runs),
        synced_at=datetime.now(timezone.utc),
    )


@router.get("/sync/status", response_model=SyncResult)
async def sync_status(db: AsyncSession = Depends(get_db)) -> SyncResult:
    stmt = select(CollectionRun).order_by(desc(CollectionRun.finished_at)).limit(1)
    result = await db.execute(stmt)
    last_run = result.scalars().first()

    if last_run is not None:
        return SyncResult(
            status="completed",
            collected_count=last_run.items_created,
            synced_at=last_run.finished_at,
        )

    return SyncResult(status="queued", collected_count=0, synced_at=datetime.now(timezone.utc))


@router.get("/runs", response_model=tuple[CollectionRunRead, ...])
async def list_collection_runs(db: AsyncSession = Depends(get_db)) -> tuple[CollectionRunRead, ...]:
    stmt = select(CollectionRun).order_by(desc(CollectionRun.started_at))
    result = await db.execute(stmt)
    runs = result.scalars().all()
    
    return tuple(
        CollectionRunRead(
            id=str(run.id),
            source_id=run.source_id,
            source_name=run.source_name,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=CollectionRunStatus(run.status),
            pages_seen=run.pages_seen,
            items_found=run.items_found,
            items_created=run.items_created,
            items_updated=run.items_updated,
            duplicates_skipped=run.duplicates_skipped,
            error=run.error,
        ) for run in runs
    )


@router.get("", response_model=tuple[SourceRead, ...])
async def list_sources(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db),
) -> tuple[SourceRead, ...]:
    return await source_registry_service.list(db, include_inactive=include_inactive)


@router.post("", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
async def create_source(
    payload: SourceCreate,
    db: AsyncSession = Depends(get_db),
) -> SourceRead:
    try:
        return await source_registry_service.create(db, payload)
    except DuplicateSourceError as error:
        raise HTTPException(status_code=409, detail="Source already exists") from error


@router.get("/{source_id}", response_model=SourceRead)
async def get_source(
    source_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> SourceRead:
    try:
        return await source_registry_service.get(db, source_id)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error


@router.patch("/{source_id}", response_model=SourceRead)
async def update_source(
    source_id: UUID,
    payload: SourceUpdate,
    db: AsyncSession = Depends(get_db),
) -> SourceRead:
    try:
        return await source_registry_service.update(db, source_id, payload)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error
    except DuplicateSourceError as error:
        raise HTTPException(status_code=409, detail="Source already exists") from error


@router.post("/{source_id}/collect", response_model=CollectionRunRead)
async def collect_source(
    source_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> CollectionRunRead:
    try:
        return await osint_pipeline.collect_source(db, source_id)
    except SourceNotFoundError as error:
        raise HTTPException(status_code=404, detail="Source not found") from error
