from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.schemas.source import SourceCreate, SourceFrequency, SourceRead, SourceStatus, SourceUpdate


class SourceNotFoundError(LookupError):
    pass


class DuplicateSourceError(ValueError):
    pass


class SourceRegistryService:
    def __init__(self, initial_sources: tuple[SourceRead, ...] = ()) -> None:
        self._sources = {source.id: source for source in initial_sources}

    def list(self, include_inactive: bool = True) -> tuple[SourceRead, ...]:
        sources = tuple(self._sources.values())

        if include_inactive:
            return tuple(sorted(sources, key=lambda source: source.name.casefold()))

        active_sources = tuple(source for source in sources if source.is_active and source.status is SourceStatus.ENABLED)

        return tuple(sorted(active_sources, key=lambda source: source.name.casefold()))

    def list_due(self, now: datetime | None = None) -> tuple[SourceRead, ...]:
        checked_at = now or datetime.now(timezone.utc)
        sources = self.list(include_inactive=False)

        return tuple(source for source in sources if self._is_due(source, checked_at))

    def create(self, payload: SourceCreate) -> SourceRead:
        if self._has_duplicate_name(payload.name):
            raise DuplicateSourceError(payload.name)

        source = SourceRead(**payload.model_dump(), status=SourceStatus.ENABLED)
        self._sources = {**self._sources, source.id: source}

        return source

    def get(self, source_id: UUID) -> SourceRead:
        source = self._sources.get(source_id)

        if source is None:
            raise SourceNotFoundError(str(source_id))

        return source

    def update(self, source_id: UUID, payload: SourceUpdate) -> SourceRead:
        source = self.get(source_id)
        update_data = payload.model_dump(exclude_unset=True)

        if "name" in update_data and self._has_duplicate_name(update_data["name"], ignored_id=source_id):
            raise DuplicateSourceError(update_data["name"])

        updated_source = source.model_copy(update=update_data)
        self._sources = {**self._sources, source_id: updated_source}

        return updated_source

    def mark_success(self, source_id: UUID, result_count: int) -> SourceRead:
        source = self.get(source_id)
        updated_source = source.model_copy(
            update={
                "status": SourceStatus.ENABLED,
                "last_sync_at": datetime.now(timezone.utc),
                "last_result_count": result_count,
                "last_error": None,
            }
        )
        self._sources = {**self._sources, source_id: updated_source}

        return updated_source

    def mark_error(self, source_id: UUID, error: str) -> SourceRead:
        source = self.get(source_id)
        updated_source = source.model_copy(
            update={
                "status": SourceStatus.ERROR,
                "last_sync_at": datetime.now(timezone.utc),
                "last_error": error[:1000],
            }
        )
        self._sources = {**self._sources, source_id: updated_source}

        return updated_source

    def _has_duplicate_name(self, name: str, ignored_id: UUID | None = None) -> bool:
        normalized_name = name.casefold().strip()

        return any(
            source.name.casefold().strip() == normalized_name and source.id != ignored_id
            for source in self._sources.values()
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

        return checked_at - source.last_sync_at >= required_interval


source_registry_service = SourceRegistryService()
