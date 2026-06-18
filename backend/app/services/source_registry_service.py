from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.source import Source
from app.schemas.source import SourceCreate, SourceFrequency, SourceRead, SourceStatus, SourceUpdate
from app.schemas.source import SourceType


class SourceNotFoundError(LookupError):
    pass


class DuplicateSourceError(ValueError):
    pass


class SourceRegistryService:
    async def list(self, db: AsyncSession, include_inactive: bool = True) -> tuple[SourceRead, ...]:
        stmt = select(Source).order_by(Source.name)
        result = await db.execute(stmt)
        sources = result.scalars().all()

        if include_inactive:
            return tuple(SourceRead.model_validate(source, from_attributes=True) for source in sources)

        active_sources = tuple(source for source in sources if source.is_active and source.status is SourceStatus.ENABLED)
        return tuple(SourceRead.model_validate(source, from_attributes=True) for source in active_sources)

    async def list_due(self, db: AsyncSession, now: datetime | None = None) -> tuple[SourceRead, ...]:
        checked_at = now or datetime.now(timezone.utc)
        sources = await self.list(db, include_inactive=False)

        return tuple(source for source in sources if self._is_due(source, checked_at))

    async def create(self, db: AsyncSession, payload: SourceCreate) -> SourceRead:
        if await self._has_duplicate_name(db, payload.name):
            raise DuplicateSourceError(payload.name)

        source_data = payload.model_dump()
        source = Source(
            **source_data,
            id=uuid4(),
            status=SourceStatus.ENABLED,
            created_at=datetime.now(timezone.utc)
        )
        db.add(source)
        await db.flush()

        return SourceRead.model_validate(source, from_attributes=True)

    async def get(self, db: AsyncSession, source_id: UUID) -> SourceRead:
        stmt = select(Source).where(Source.id == source_id)
        result = await db.execute(stmt)
        source = result.scalars().first()

        if source is None:
            raise SourceNotFoundError(str(source_id))

        return SourceRead.model_validate(source, from_attributes=True)

    async def update(self, db: AsyncSession, source_id: UUID, payload: SourceUpdate) -> SourceRead:
        stmt = select(Source).where(Source.id == source_id)
        result = await db.execute(stmt)
        source = result.scalars().first()

        if source is None:
            raise SourceNotFoundError(str(source_id))

        update_data = payload.model_dump(exclude_unset=True)

        if "name" in update_data and await self._has_duplicate_name(db, update_data["name"], ignored_id=source_id):
            raise DuplicateSourceError(update_data["name"])

        for key, value in update_data.items():
            setattr(source, key, value)

        await db.flush()

        return SourceRead.model_validate(source, from_attributes=True)

    async def mark_success(self, db: AsyncSession, source_id: UUID, result_count: int) -> SourceRead:
        stmt = select(Source).where(Source.id == source_id)
        result = await db.execute(stmt)
        source = result.scalars().first()

        if source is None:
            raise SourceNotFoundError(str(source_id))

        source.status = SourceStatus.ENABLED
        source.last_sync_at = datetime.now(timezone.utc)
        source.last_result_count = result_count
        source.last_error = None

        await db.flush()

        return SourceRead.model_validate(source, from_attributes=True)

    async def mark_error(self, db: AsyncSession, source_id: UUID, error: str) -> SourceRead:
        stmt = select(Source).where(Source.id == source_id)
        result = await db.execute(stmt)
        source = result.scalars().first()

        if source is None:
            raise SourceNotFoundError(str(source_id))

        source.status = SourceStatus.ERROR
        source.last_sync_at = datetime.now(timezone.utc)
        source.last_error = error[:1000]

        await db.flush()

        return SourceRead.model_validate(source, from_attributes=True)

    async def _has_duplicate_name(self, db: AsyncSession, name: str, ignored_id: UUID | None = None) -> bool:
        normalized_name = name.casefold().strip()
        stmt = select(Source)
        result = await db.execute(stmt)
        sources = result.scalars().all()

        return any(
            source.name.casefold().strip() == normalized_name and source.id != ignored_id
            for source in sources
        )

    def _is_due(self, source: SourceRead, checked_at: datetime) -> bool:
        if source.frequency is SourceFrequency.MANUAL:
            return False

        if source.last_sync_at is None:
            return True

        intervals = {
            SourceFrequency.DAILY: timedelta(days=1),
            SourceFrequency.WEEKLY: timedelta(days=7),
            SourceFrequency.MONTHLY: timedelta(days=30),
        }
        required_interval = intervals.get(source.frequency)

        if required_interval is None:
            return False

        return checked_at - source.last_sync_at.replace(tzinfo=timezone.utc) >= required_interval


DEFAULT_OSINT_SOURCES: tuple[SourceCreate, ...] = (
    SourceCreate(
        name="ReliefWeb ICT Jobs",
        url="https://api.reliefweb.int/v1/jobs",
        type=SourceType.API,
        frequency=SourceFrequency.DAILY,
        adapter_key="reliefweb_jobs_api",
        is_active=True,
    ),
    SourceCreate(
        name="UN Talent RSS",
        url="https://untalent.org/jobs/rss",
        type=SourceType.RSS,
        frequency=SourceFrequency.DAILY,
        adapter_key="untalent_rss",
        is_active=True,
    ),
    SourceCreate(
        name="Opportunities For Youth",
        url="https://opportunitiesforyouth.org/",
        type=SourceType.SCRAPER,
        frequency=SourceFrequency.DAILY,
        adapter_key="ofy_home",
        is_active=True,
    ),
)


source_registry_service = SourceRegistryService()
