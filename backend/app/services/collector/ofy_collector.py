from datetime import datetime, timezone
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from app.schemas.opportunity import FundingType, OpportunityCreate, OpportunityRequiredLevel, OpportunityType
from app.services.collector.base_collector import BaseCollector, CollectorResult


OFY_URL = "https://opportunitiesforyouth.org/"


class OpportunitiesForYouthCollector(BaseCollector):
    source_name = "ofy"

    def __init__(self, client: httpx.AsyncClient | None = None, limit: int = 20) -> None:
        self._client = client
        self._limit = limit

    async def collect(self) -> CollectorResult:
        async with self._resolve_client() as client:
            response = await client.get(OFY_URL, timeout=20)
            response.raise_for_status()

        opportunities = parse_ofy_html(response.text, limit=self._limit)

        return CollectorResult(source_name=self.source_name, opportunities=opportunities)

    def _resolve_client(self) -> httpx.AsyncClient:
        if self._client is not None:
            return self._client

        return httpx.AsyncClient(headers={"User-Agent": "to-the-world-opportunity-bot/0.1"})


def parse_ofy_html(html: str, limit: int) -> tuple[OpportunityCreate, ...]:
    soup = BeautifulSoup(html, "html.parser")
    links = tuple(link for link in soup.select("article a[href], h2 a[href], h3 a[href]") if link.get_text(strip=True))
    unique_links = dedupe_links(links)

    return tuple(map_ofy_link(link) for link in unique_links[:limit])


def dedupe_links(links: tuple[object, ...]) -> tuple[object, ...]:
    seen_urls: frozenset[str] = frozenset()
    unique_links: tuple[object, ...] = ()

    for link in links:
        href = str(link.get("href"))
        absolute_url = urljoin(OFY_URL, href)

        if absolute_url in seen_urls:
            continue

        seen_urls = frozenset((*seen_urls, absolute_url))
        unique_links = (*unique_links, link)

    return unique_links


def map_ofy_link(link: object) -> OpportunityCreate:
    title = str(link.get_text(" ", strip=True))
    official_url = urljoin(OFY_URL, str(link.get("href")))

    return OpportunityCreate(
        external_id=official_url,
        source_name="ofy",
        source_url=OFY_URL,
        official_url=official_url,
        title=title,
        organization="Opportunities For Youth",
        type=infer_type(title),
        destination_country=None,
        destination_city=None,
        is_remote="online" in title.lower() or "remote" in title.lower(),
        deadline=None,
        deadline_confirmed=False,
        funding_type=infer_funding(title),
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
        required_domains=("software", "data", "cybersecurity"),
        required_experience_years=None,
        required_languages=("English",),
        required_documents=("CV", "Motivation letter"),
        raw_description=title,
        summary=None,
        eligibility_notes="Open page must be verified before applying.",
        risks="OFY pages can summarize third-party offers; official application link must be checked.",
        candidacy_angle="Filter for funded, tech-aligned youth opportunities before spending time.",
        collected_at=datetime.now(timezone.utc),
        expires_at=None,
    )


def infer_type(title: str) -> OpportunityType:
    normalized_title = title.lower()

    if "intern" in normalized_title:
        return OpportunityType.INTERNSHIP

    if "fellow" in normalized_title:
        return OpportunityType.FELLOWSHIP

    if "training" in normalized_title or "course" in normalized_title:
        return OpportunityType.TRAINING

    if "scholar" in normalized_title:
        return OpportunityType.SCHOLARSHIP

    return OpportunityType.JOB


def infer_funding(title: str) -> FundingType:
    normalized_title = title.lower()

    if "fully funded" in normalized_title:
        return FundingType.FULL

    if "paid" in normalized_title or "stipend" in normalized_title:
        return FundingType.PARTIAL

    return FundingType.UNKNOWN
