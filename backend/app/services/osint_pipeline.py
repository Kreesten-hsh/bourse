from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
import hashlib
from uuid import UUID

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.opportunity import OpportunityCreate, OpportunityStatus
from app.schemas.osint import CollectionRunRead, CollectionRunStatus, ExtractedOpportunityDraft, FetchedDocument, ValidationStatus
from app.schemas.source import SourceRead
from app.services.collector.base_collector import BaseCollector
from app.services.collector.ofy_collector import OpportunitiesForYouthCollector
from app.services.collector.reliefweb_collector import ReliefWebCollector
from app.services.collector.untalent_collector import UNTalentCollector
from app.services.dedup_service import DeduplicationCandidate, detect_duplicate
from app.services.opportunity_service import OpportunityService, opportunity_service
from app.services.osint_extractor import GenericOpportunityExtractor
from app.services.source_registry_service import SourceRegistryService, source_registry_service
from app.models.collection_run import CollectionRun


FetchSource = Callable[[SourceRead], Awaitable[FetchedDocument]]
CollectorFactory = Callable[[], BaseCollector]

DEFAULT_COLLECTOR_FACTORIES: dict[str, CollectorFactory] = {
    "reliefweb_jobs_api": ReliefWebCollector,
    "untalent_rss": UNTalentCollector,
    "ofy_home": OpportunitiesForYouthCollector,
}


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
        collector_factories: dict[str, CollectorFactory] | None = None,
    ) -> None:
        self._source_registry = source_registry
        self._opportunity_service = opportunity_service
        self._extractor = extractor
        self._fetcher = fetcher
        self._collector_factories = collector_factories or DEFAULT_COLLECTOR_FACTORIES

    async def collect_all_sources(self, db: AsyncSession) -> tuple[CollectionRunRead, ...]:
        sources = await self._source_registry.list(db, include_inactive=False)
        return await self._collect_sources(db, sources)

    async def collect_due_sources(self, db: AsyncSession) -> tuple[CollectionRunRead, ...]:
        sources = await self._source_registry.list_due(db)
        return await self._collect_sources(db, sources)

    async def _collect_sources(self, db: AsyncSession, sources: tuple[SourceRead, ...]) -> tuple[CollectionRunRead, ...]:
        runs: tuple[CollectionRunRead, ...] = ()

        for source in sources:
            run = await self.collect_source(db, source.id)
            runs = (*runs, run)

        return runs

    async def collect_source(self, db: AsyncSession, source_id: UUID) -> CollectionRunRead:
        source = await self._source_registry.get(db, source_id)
        started_at = datetime.now(timezone.utc)

        if not source.is_active:
            return await self._record_failed_run(db, source, started_at, "Source inactive")

        try:
            drafts = await self._collect_drafts(source)
            created_count, duplicate_count = await self._publish_drafts(db, drafts)
            await self._source_registry.mark_success(db, source.id, created_count)

            return await self._record_completed_run(
                db=db,
                source=source,
                started_at=started_at,
                pages_seen=1,
                items_found=len(drafts),
                items_created=created_count,
                duplicates_skipped=duplicate_count,
            )
        except Exception as error:
            await self._source_registry.mark_error(db, source.id, str(error))
            return await self._record_failed_run(db, source, started_at, str(error))

    async def _collect_drafts(self, source: SourceRead) -> tuple[ExtractedOpportunityDraft, ...]:
        collector_factory = self._collector_factories.get(source.adapter_key)

        if collector_factory is None:
            document = await self._fetcher(source)
            self._ensure_successful_fetch(document)
            return self._extractor.extract(source, document.content, document.content_type, document.url)

        result = await collector_factory().collect()

        return tuple(self._build_draft_from_payload(payload) for payload in result.opportunities)

    def _build_draft_from_payload(self, payload: OpportunityCreate) -> ExtractedOpportunityDraft:
        validation_status = ValidationStatus.VERIFIED if payload.deadline_confirmed else ValidationStatus.NEEDS_REVIEW
        validation_notes = () if payload.deadline_confirmed else ("Échéance non confirmée",)

        return ExtractedOpportunityDraft(
            payload=payload,
            canonical_url=payload.official_url,
            content_hash=self._content_hash(payload),
            validation_status=validation_status,
            validation_notes=validation_notes,
        )

    async def _publish_drafts(self, db: AsyncSession, drafts: tuple[ExtractedOpportunityDraft, ...]) -> tuple[int, int]:
        created_count = 0
        duplicate_count = 0
        content_hashes: set[str] = set()

        for draft in drafts:
            if draft.validation_status is ValidationStatus.REJECTED:
                continue

            if draft.content_hash in content_hashes or await self._is_duplicate(db, draft.payload, draft.content_hash):
                duplicate_count = duplicate_count + 1
                content_hashes.add(draft.content_hash)
                continue

            # Pass content_hash to create
            payload_with_hash = draft.payload.model_copy(update={"content_hash": draft.content_hash})
            created = await self._opportunity_service.create(db, payload_with_hash)
            if draft.validation_status is ValidationStatus.NEEDS_REVIEW:
                await self._opportunity_service.update_status(db, created.id, OpportunityStatus.ANALYZING)

            created_count = created_count + 1
            content_hashes.add(draft.content_hash)

        return created_count, duplicate_count

    async def _is_duplicate(self, db: AsyncSession, payload: OpportunityCreate, content_hash: str) -> bool:
        from app.models.opportunity import Opportunity
        from sqlalchemy import select
        
        # 1. Fast check by content_hash
        stmt = select(Opportunity).where(Opportunity.content_hash == content_hash)
        result = await db.execute(stmt)
        if result.scalars().first() is not None:
            return True

        # 2. Semantic check via DeduplicationCandidate
        existing_opportunities = await self._opportunity_service.list(db)
        existing_candidates = tuple(
            DeduplicationCandidate(
                id=str(opportunity.id),
                title=opportunity.title,
                organization=opportunity.organization,
                official_url=opportunity.official_url,
            )
            for opportunity in existing_opportunities
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

    def _content_hash(self, payload: OpportunityCreate) -> str:
        raw_value = f"{payload.source_name}|{payload.official_url}|{payload.title}|{payload.raw_description}"

        return hashlib.sha256(raw_value.encode("utf-8")).hexdigest()

    async def _record_completed_run(
        self,
        db: AsyncSession,
        source: SourceRead,
        started_at: datetime,
        pages_seen: int,
        items_found: int,
        items_created: int,
        duplicates_skipped: int,
    ) -> CollectionRunRead:
        import uuid
        run_id = uuid.uuid4()
        run = CollectionRun(
            id=run_id,
            source_id=source.id,
            source_name=source.name,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            status=CollectionRunStatus.COMPLETED.value,
            pages_seen=pages_seen,
            items_found=items_found,
            items_created=items_created,
            items_updated=0,
            duplicates_skipped=duplicates_skipped,
            error=None,
        )
        db.add(run)
        await db.flush()

        return CollectionRunRead(
            id=str(run_id),
            source_id=source.id,
            source_name=source.name,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=CollectionRunStatus.COMPLETED,
            pages_seen=pages_seen,
            items_found=items_found,
            items_created=items_created,
            items_updated=0,
            duplicates_skipped=duplicates_skipped,
            error=None,
        )

    async def _record_failed_run(self, db: AsyncSession, source: SourceRead, started_at: datetime, error: str) -> CollectionRunRead:
        import uuid
        run_id = uuid.uuid4()
        run = CollectionRun(
            id=run_id,
            source_id=source.id,
            source_name=source.name,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            status=CollectionRunStatus.FAILED.value,
            pages_seen=0,
            items_found=0,
            items_created=0,
            items_updated=0,
            duplicates_skipped=0,
            error=error[:1000],
        )
        db.add(run)
        await db.flush()

        return CollectionRunRead(
            id=str(run_id),
            source_id=source.id,
            source_name=source.name,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=CollectionRunStatus.FAILED,
            pages_seen=0,
            items_found=0,
            items_created=0,
            items_updated=0,
            duplicates_skipped=0,
            error=error[:1000],
        )


osint_pipeline = OsintPipeline(
    source_registry=source_registry_service,
    opportunity_service=opportunity_service,
    extractor=GenericOpportunityExtractor(),
)
