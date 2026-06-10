from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas.opportunity import FundingType, OpportunityCreate, OpportunityRequiredLevel, OpportunityType
from app.services.collector.base_collector import BaseCollector, CollectorResult


RELIEFWEB_JOBS_URL = "https://api.reliefweb.int/v1/jobs"


class ReliefWebCollector(BaseCollector):
    source_name = "reliefweb"

    def __init__(self, client: httpx.AsyncClient | None = None, page_limit: int = 1) -> None:
        self._client = client
        self._page_limit = page_limit

    async def collect(self) -> CollectorResult:
        opportunities: list[OpportunityCreate] = []

        async with self._resolve_client() as client:
            for page_index in range(self._page_limit):
                payload = await self.fetch_page(client, offset=page_index * 50)
                page_opportunities = tuple(map_reliefweb_items(payload))
                opportunities = [*opportunities, *page_opportunities]

                if len(page_opportunities) < 50:
                    break

        return CollectorResult(source_name=self.source_name, opportunities=tuple(opportunities))

    async def fetch_page(self, client: httpx.AsyncClient, offset: int) -> dict[str, Any]:
        response = await client.get(RELIEFWEB_JOBS_URL, params=build_reliefweb_params(offset))
        response.raise_for_status()

        return response.json()

    def _resolve_client(self) -> httpx.AsyncClient:
        if self._client is not None:
            return self._client

        return httpx.AsyncClient(timeout=20)


def build_reliefweb_params(offset: int) -> list[tuple[str, str | int]]:
    settings = get_settings()

    return [
        ("appname", settings.reliefweb_app_name),
        ("limit", 50),
        ("offset", offset),
        ("sort[]", "date.created:desc"),
        ("profile", "full"),
        ("field[]", "id"),
        ("field[]", "title"),
        ("field[]", "body"),
        ("field[]", "date"),
        ("field[]", "source"),
        ("field[]", "country"),
        ("field[]", "url"),
        ("field[]", "career_categories"),
        ("filter[field]", "career_categories.name"),
        ("filter[value]", "Information and Communications Technology"),
    ]


def map_reliefweb_items(payload: dict[str, Any]) -> tuple[OpportunityCreate, ...]:
    raw_items = payload.get("data", ())

    if not isinstance(raw_items, list):
        return ()

    return tuple(map_reliefweb_item(item) for item in raw_items if isinstance(item, dict))


def map_reliefweb_item(item: dict[str, Any]) -> OpportunityCreate:
    fields = item.get("fields", {})
    safe_fields = fields if isinstance(fields, dict) else {}
    country = first_named_value(safe_fields.get("country"))
    source = first_named_value(safe_fields.get("source")) or "ReliefWeb"

    return OpportunityCreate(
        external_id=str(item.get("id", safe_fields.get("id", "unknown"))),
        source_name="reliefweb",
        source_url=RELIEFWEB_JOBS_URL,
        official_url=str(safe_fields.get("url") or RELIEFWEB_JOBS_URL),
        title=str(safe_fields.get("title") or "Untitled ICT opportunity"),
        organization=source,
        type=OpportunityType.JOB,
        destination_country=country,
        destination_city=None,
        is_remote=False,
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
        required_domains=("Information and Communications Technology", "software"),
        required_experience_years=None,
        required_languages=("English",),
        required_documents=("CV", "Cover letter"),
        raw_description=str(safe_fields.get("body") or ""),
        summary=None,
        eligibility_notes=None,
        risks="Deadline and funding must be verified on the official page.",
        candidacy_angle="Position software and cybersecurity projects as digital resilience assets.",
        collected_at=datetime.now(timezone.utc),
        expires_at=None,
    )


def first_named_value(value: object) -> str | None:
    if not isinstance(value, list) or not value:
        return None

    first_value = value[0]

    if not isinstance(first_value, dict):
        return None

    name = first_value.get("name")

    return str(name) if name is not None else None
