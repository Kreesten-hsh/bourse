from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from uuid import UUID

import httpx

from app.schemas.opportunity import OpportunityCreate, OpportunityStatus
from app.schemas.osint import CollectionRunRead, CollectionRunStatus, ExtractedOpportunityDraft, FetchedDocument, ValidationStatus
from app.schemas.source import SourceRead
from app.services.dedup_service import DeduplicationCandidate, detect_duplicate
from app.services.opportunity_service import OpportunityService, opportunity_service
from app.services.osint_extractor import GenericOpportunityExtractor
from app.services.source_registry_service import SourceRegistryService, source_registry_service


FetchSource = Callable[[SourceRead], Awaitable[FetchedDocument]]


async def default_fetch_source(source: SourceRead) -> FetchedDocument:
    async with httpx.AsyncClient(timeout=httpx.Timeout(12.0), follow_redirects=True) as client:
        response = await client.get(
            source.url,
            headers={
                "User-Agent": "to-the-world-osint/0.1 (+public-opportunity-watch)",
                "Accept": "text/html,application/rss+xml,application/json;q=0.9,*/*;q=0.8",
            },
        )

    return FetchedDocument(
        url=str(response.url),
        status_code=response.status_code,
        content_type=response.headers.get("content-type", ""),
        content=response.text,
        fetched_at=datetime.now(timezone.utc),
    )


class OsintPipeline:
    def __init__(
        self,
        source_registry: SourceRegistryService,
        opportunity_service: OpportunityService,
        extractor: GenericOpportunityExtractor,
        fetcher: FetchSource = default_fetch_source,
    ) -> None:
        self._source_registry = source_registry
        self._opportunity_service = opportunity_service
        self._extractor = extractor
        self._fetcher = fetcher
        self._content_hashes: frozenset[str] = frozenset()
        self._runs: tuple[CollectionRunRead, ...] = ()

    def list_runs(self) -> tuple[CollectionRunRead, ...]:
        return tuple(sorted(self._runs, key=lambda run: run.started_at, reverse=True))

    async def collect_all_sources(self) -> tuple[CollectionRunRead, ...]:
        sources = self._source_registry.list(include_inactive=False)
        return await self._collect_sources(sources)

    async def collect_due_sources(self) -> tuple[CollectionRunRead, ...]:
        sources = self._source_registry.list_due()
        return await self._collect_sources(sources)

    async def _collect_sources(self, sources: tuple[SourceRead, ...]) -> tuple[CollectionRunRead, ...]:
        runs: tuple[CollectionRunRead, ...] = ()

        for source in sources:
            run = await self.collect_source(source.id)
            runs = (*runs, run)

        return runs

    async def collect_source(self, source_id: UUID) -> CollectionRunRead:
        source = self._source_registry.get(source_id)
        started_at = datetime.now(timezone.utc)

        if not source.is_active:
            return self._record_failed_run(source, started_at, "Source inactive")

        try:
            document = await self._fetcher(source)
            self._ensure_successful_fetch(document)
            drafts = self._extractor.extract(source, document.content, document.content_type, document.url)
            created_count, duplicate_count = self._publish_drafts(drafts)
            self._source_registry.mark_success(source.id, created_count)

            return self._record_completed_run(
                source=source,
                started_at=started_at,
                pages_seen=1,
                items_found=len(drafts),
                items_created=created_count,
                duplicates_skipped=duplicate_count,
            )
        except Exception as error:
            self._source_registry.mark_error(source.id, str(error))
            return self._record_failed_run(source, started_at, str(error))

    def _publish_drafts(self, drafts: tuple[ExtractedOpportunityDraft, ...]) -> tuple[int, int]:
        created_count = 0
        duplicate_count = 0

        for draft in drafts:
            if draft.validation_status is ValidationStatus.REJECTED:
                continue

            if draft.content_hash in self._content_hashes or self._is_duplicate(draft.payload):
                duplicate_count = duplicate_count + 1
                self._content_hashes = self._content_hashes | frozenset((draft.content_hash,))
                continue

            created = self._opportunity_service.create(draft.payload)
            if draft.validation_status is ValidationStatus.NEEDS_REVIEW:
                self._opportunity_service.update_status(created.id, OpportunityStatus.ANALYZING)

            created_count = created_count + 1
            self._content_hashes = self._content_hashes | frozenset((draft.content_hash,))

        return created_count, duplicate_count

    def _is_duplicate(self, payload: OpportunityCreate) -> bool:
        existing_candidates = tuple(
            DeduplicationCandidate(
                id=str(opportunity.id),
                title=opportunity.title,
                organization=opportunity.organization,
                official_url=opportunity.official_url,
            )
            for opportunity in self._opportunity_service.list()
        )
        candidate = DeduplicationCandidate(
            id=payload.external_id,
            title=payload.title,
            organization=payload.organization,
            official_url=payload.official_url,
        )

        return detect_duplicate(candidate, existing_candidates).is_duplicate

    def _ensure_successful_fetch(self, document: FetchedDocument) -> None:
        if document.status_code >= 400:
            raise ValueError(f"Source returned HTTP {document.status_code}")

    def _record_completed_run(
        self,
        source: SourceRead,
        started_at: datetime,
        pages_seen: int,
        items_found: int,
        items_created: int,
        duplicates_skipped: int,
    ) -> CollectionRunRead:
        run = CollectionRunRead(
            source_id=source.id,
            source_name=source.name,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            status=CollectionRunStatus.COMPLETED,
            pages_seen=pages_seen,
            items_found=items_found,
            items_created=items_created,
            items_updated=0,
            duplicates_skipped=duplicates_skipped,
            error=None,
        )
        self._runs = (*self._runs, run)

        return run

    def _record_failed_run(self, source: SourceRead, started_at: datetime, error: str) -> CollectionRunRead:
        run = CollectionRunRead(
            source_id=source.id,
            source_name=source.name,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            status=CollectionRunStatus.FAILED,
            pages_seen=0,
            items_found=0,
            items_created=0,
            items_updated=0,
            duplicates_skipped=0,
            error=error[:1000],
        )
        self._runs = (*self._runs, run)

        return run


osint_pipeline = OsintPipeline(
    source_registry=source_registry_service,
    opportunity_service=opportunity_service,
    extractor=GenericOpportunityExtractor(),
)
