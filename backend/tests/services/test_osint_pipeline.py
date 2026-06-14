import asyncio
from datetime import datetime, timedelta, timezone

from pydantic import ValidationError

from app.schemas.opportunity import FundingType, OpportunityCreate, OpportunityRequiredLevel, OpportunityType
from app.schemas.osint import FetchedDocument
from app.schemas.source import SourceCreate, SourceFrequency, SourceType
from app.services.collector.base_collector import BaseCollector, CollectorResult
from app.services.opportunity_service import OpportunityService
from app.services.osint_extractor import GenericOpportunityExtractor
from app.services.osint_pipeline import OsintPipeline
from app.services.source_registry_service import DEFAULT_OSINT_SOURCES, SourceRegistryService


class FakeAdapterCollector(BaseCollector):
    source_name = "fake_adapter"

    async def collect(self) -> CollectorResult:
        now = datetime.now(timezone.utc)
        payload = OpportunityCreate(
            external_id="fake-adapter-1",
            source_name=self.source_name,
            source_url="https://adapter.example.org/feed",
            official_url="https://adapter.example.org/apply",
            title="Fully funded software fellowship for African students",
            organization="Adapter Foundation",
            type=OpportunityType.FELLOWSHIP,
            destination_country=None,
            destination_city=None,
            is_remote=True,
            deadline=None,
            deadline_confirmed=False,
            funding_type=FundingType.FULL,
            monthly_stipend=750.0,
            monthly_stipend_currency="USD",
            travel_covered=True,
            housing_covered=None,
            tuition_covered=None,
            visa_covered=None,
            insurance_covered=None,
            meals_covered=None,
            application_fee=False,
            required_nationality="Afrique",
            age_min=None,
            age_max=None,
            required_level=OpportunityRequiredLevel.ANY,
            required_domains=("software",),
            required_experience_years=None,
            required_languages=("English",),
            required_documents=("CV",),
            raw_description="Adapter payload should bypass generic HTML extraction.",
            summary="A real collector payload.",
            eligibility_notes=None,
            risks="Deadline must be verified.",
            candidacy_angle="Lead with software and cybersecurity projects.",
            collected_at=now,
            expires_at=None,
        )

        return CollectorResult(source_name=self.source_name, opportunities=(payload,))


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


def test_default_osint_sources_are_registered_as_public_sources() -> None:
    registry = SourceRegistryService(initial_sources=DEFAULT_OSINT_SOURCES)
    sources = registry.list(include_inactive=False)
    adapter_keys = {source.adapter_key for source in sources}

    assert {"reliefweb_jobs_api", "untalent_rss", "ofy_home"}.issubset(adapter_keys)
    assert all(source.url.startswith("https://") for source in sources)


def test_osint_pipeline_uses_adapter_collector_when_adapter_key_matches() -> None:
    async def blocked_fetcher(source):
        raise AssertionError("adapter collector should bypass the generic fetcher")

    registry = SourceRegistryService()
    opportunities = OpportunityService()
    source = registry.create(
        SourceCreate(
            name="Adapter feed",
            url="https://adapter.example.org/feed",
            type=SourceType.API,
            frequency=SourceFrequency.DAILY,
            adapter_key="fake_adapter",
        )
    )
    pipeline = OsintPipeline(
        source_registry=registry,
        opportunity_service=opportunities,
        extractor=GenericOpportunityExtractor(),
        fetcher=blocked_fetcher,
        collector_factories={"fake_adapter": FakeAdapterCollector},
    )

    run = asyncio.run(pipeline.collect_source(source.id))

    assert run.items_found == 1
    assert run.items_created == 1
    assert opportunities.list()[0].source_name == "fake_adapter"
