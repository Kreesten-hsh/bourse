import asyncio
from datetime import datetime, timedelta, timezone

from pydantic import ValidationError

from app.schemas.osint import FetchedDocument
from app.schemas.source import SourceCreate, SourceFrequency, SourceType
from app.services.opportunity_service import OpportunityService
from app.services.osint_extractor import GenericOpportunityExtractor
from app.services.osint_pipeline import OsintPipeline
from app.services.source_registry_service import SourceRegistryService


def test_osint_pipeline_publishes_valid_public_html_source_once() -> None:
    async def fake_fetcher(source):
        return FetchedDocument(
            url=source.url,
            status_code=200,
            content_type="text/html",
            content="""
            <html>
              <body>
                <a href="/fully-funded-cybersecurity-scholarship">
                  Bourse cybersécurité entièrement financée pour étudiants africains
                </a>
              </body>
            </html>
            """,
            fetched_at=datetime.now(timezone.utc),
        )

    registry = SourceRegistryService()
    opportunities = OpportunityService()
    source = registry.create(
        SourceCreate(
            name="Opportunity Hub",
            url="https://opportunity.example.org/list",
            type=SourceType.SCRAPER,
            frequency=SourceFrequency.DAILY,
            adapter_key="generic_html",
        )
    )
    pipeline = OsintPipeline(
        source_registry=registry,
        opportunity_service=opportunities,
        extractor=GenericOpportunityExtractor(item_limit=10),
        fetcher=fake_fetcher,
    )

    first_run = asyncio.run(pipeline.collect_source(source.id))
    second_run = asyncio.run(pipeline.collect_source(source.id))

    assert first_run.items_found == 1
    assert first_run.items_created == 1
    assert first_run.duplicates_skipped == 0
    assert second_run.items_created == 0
    assert second_run.duplicates_skipped == 1
    assert len(opportunities.list()) == 1
    assert opportunities.list()[0].funding_type == "full"


def test_source_registry_rejects_local_or_private_urls() -> None:
    registry = SourceRegistryService()

    try:
        registry.create(
            SourceCreate(
                name="Localhost",
                url="http://127.0.0.1/private",
                type=SourceType.SCRAPER,
            )
        )
    except ValidationError as error:
        assert "public" in str(error)
    else:
        raise AssertionError("OSINT sources must be public HTTP(S) URLs.")


def test_source_registry_returns_only_due_active_sources() -> None:
    registry = SourceRegistryService()
    source = registry.create(
        SourceCreate(
            name="Weekly source",
            url="https://weekly.example.org/jobs",
            type=SourceType.SCRAPER,
            frequency=SourceFrequency.WEEKLY,
        )
    )

    registry.mark_success(source.id, result_count=2)
    just_after_sync = datetime.now(timezone.utc) + timedelta(days=1)
    next_week = datetime.now(timezone.utc) + timedelta(days=8)

    assert registry.list_due(now=just_after_sync) == ()
    assert registry.list_due(now=next_week)[0].id == source.id
