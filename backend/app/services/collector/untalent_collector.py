from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

import feedparser
import httpx

from app.schemas.opportunity import FundingType, OpportunityCreate, OpportunityRequiredLevel, OpportunityType
from app.services.collector.base_collector import BaseCollector, CollectorResult


UNTALENT_RSS_URL = "https://untalent.org/jobs/rss"


class UNTalentCollector(BaseCollector):
    source_name = "untalent"

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client

    async def collect(self) -> CollectorResult:
        async with self._resolve_client() as client:
            response = await client.get(UNTALENT_RSS_URL, timeout=20)
            response.raise_for_status()

        parsed_feed = feedparser.parse(response.text)
        entries = tuple(map_untalent_entry(entry) for entry in parsed_feed.entries)

        return CollectorResult(source_name=self.source_name, opportunities=entries)

    def _resolve_client(self) -> httpx.AsyncClient:
        if self._client is not None:
            return self._client

        return httpx.AsyncClient()


def map_untalent_entry(entry: Any) -> OpportunityCreate:
    published_at = parse_rss_date(getattr(entry, "published", None))
    description = str(getattr(entry, "description", ""))
    link = str(getattr(entry, "link", UNTALENT_RSS_URL))
    title = str(getattr(entry, "title", "UN Talent opportunity"))
    author = str(getattr(entry, "author", "UN Talent"))

    return OpportunityCreate(
        external_id=link,
        source_name="untalent",
        source_url=UNTALENT_RSS_URL,
        official_url=link,
        title=title,
        organization=author,
        type=OpportunityType.VOLUNTEER,
        destination_country=None,
        destination_city=None,
        is_remote="remote" in title.lower(),
        deadline=None,
        deadline_confirmed=False,
        funding_type=FundingType.UNKNOWN,
        monthly_stipend=None,
        monthly_stipend_currency="USD",
        travel_covered=None,
        housing_covered=None,
        tuition_covered=None,
        visa_covered=None,
        insurance_covered=None,
        meals_covered=None,
        application_fee=False,
        required_nationality=None,
        age_min=None,
        age_max=None,
        required_level=OpportunityRequiredLevel.ANY,
        required_domains=("ICT", "software"),
        required_experience_years=None,
        required_languages=("English",),
        required_documents=("CV",),
        raw_description=description,
        summary=None,
        eligibility_notes="RSS feed rarely exposes full eligibility; verify the official page.",
        risks="Funding and deadline absent in the RSS feed.",
        candidacy_angle="Use software, web, and cybersecurity projects to show practical digital contribution.",
        collected_at=published_at,
        expires_at=None,
    )


def parse_rss_date(value: str | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)

    parsed_value = parsedate_to_datetime(value)

    if parsed_value.tzinfo is None:
        return parsed_value.replace(tzinfo=timezone.utc)

    return parsed_value
