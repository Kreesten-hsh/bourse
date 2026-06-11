import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin

import feedparser
from bs4 import BeautifulSoup

from app.schemas.opportunity import FundingType, OpportunityCreate, OpportunityRequiredLevel, OpportunityType
from app.schemas.osint import ExtractedOpportunityDraft, ValidationStatus
from app.schemas.source import SourceRead, SourceType
from app.core.security import canonicalize_url


OPPORTUNITY_TERMS = (
    "bourse",
    "scholarship",
    "stage",
    "internship",
    "fellowship",
    "programme",
    "program",
    "formation",
    "training",
    "volunteer",
    "volontariat",
    "emploi",
    "job",
)


class GenericOpportunityExtractor:
    def __init__(self, item_limit: int = 25) -> None:
        self.item_limit = item_limit

    def extract(self, source: SourceRead, content: str, content_type: str, fetched_url: str) -> tuple[ExtractedOpportunityDraft, ...]:
        if not content.strip():
            return ()

        normalized_content_type = content_type.casefold()

        if source.type is SourceType.RSS or "xml" in normalized_content_type or "rss" in normalized_content_type:
            return self._extract_rss(source, content, fetched_url)

        if source.type is SourceType.API or "json" in normalized_content_type:
            return self._extract_json(source, content, fetched_url)

        return self._extract_html(source, content, fetched_url)

    def _extract_html(self, source: SourceRead, content: str, fetched_url: str) -> tuple[ExtractedOpportunityDraft, ...]:
        soup = BeautifulSoup(content, "html.parser")
        anchors = tuple(anchor for anchor in soup.find_all("a") if self._looks_like_opportunity(anchor.get_text(" ", strip=True)))
        drafts = tuple(
            self._build_draft(
                source=source,
                title=anchor.get_text(" ", strip=True),
                href=anchor.get("href") or fetched_url,
                description=anchor.find_parent().get_text(" ", strip=True) if anchor.find_parent() else anchor.get_text(" ", strip=True),
                fetched_url=fetched_url,
            )
            for anchor in anchors[: self.item_limit]
        )

        if drafts:
            return drafts

        fallback_title = self._fallback_title(soup)
        if not self._looks_like_opportunity(fallback_title):
            return ()

        return (
            self._build_draft(
                source=source,
                title=fallback_title,
                href=fetched_url,
                description=soup.get_text(" ", strip=True)[:2000],
                fetched_url=fetched_url,
            ),
        )

    def _extract_rss(self, source: SourceRead, content: str, fetched_url: str) -> tuple[ExtractedOpportunityDraft, ...]:
        feed = feedparser.parse(content)
        drafts: list[ExtractedOpportunityDraft] = []

        for entry in feed.entries[: self.item_limit]:
            title = str(entry.get("title", "")).strip()
            link = str(entry.get("link", fetched_url)).strip()
            description = str(entry.get("summary", entry.get("description", title))).strip()

            if self._looks_like_opportunity(title):
                drafts.append(self._build_draft(source, title, link, description, fetched_url))

        return tuple(drafts)

    def _extract_json(self, source: SourceRead, content: str, fetched_url: str) -> tuple[ExtractedOpportunityDraft, ...]:
        try:
            parsed_content = json.loads(content)
        except json.JSONDecodeError:
            return ()

        items = self._json_items(parsed_content)
        drafts: list[ExtractedOpportunityDraft] = []

        for item in items[: self.item_limit]:
            title = str(item.get("title") or item.get("name") or "").strip()
            href = str(item.get("url") or item.get("link") or item.get("official_url") or fetched_url).strip()
            description = str(item.get("description") or item.get("summary") or title).strip()

            if self._looks_like_opportunity(title):
                drafts.append(self._build_draft(source, title, href, description, fetched_url))

        return tuple(drafts)

    def _build_draft(
        self,
        source: SourceRead,
        title: str,
        href: str,
        description: str,
        fetched_url: str,
    ) -> ExtractedOpportunityDraft:
        official_url = canonicalize_url(urljoin(fetched_url, href))
        collected_at = datetime.now(timezone.utc)
        body_text = self._clean_text(f"{title} {description}")
        deadline = self._extract_deadline(body_text)
        payload = OpportunityCreate(
            external_id=self._external_id(source.name, official_url, title),
            source_name=source.name,
            source_url=source.url,
            official_url=official_url,
            title=self._clean_text(title)[:500],
            organization=source.name,
            type=self._infer_type(body_text),
            destination_country=None,
            destination_city=None,
            is_remote=self._contains_any(body_text, ("remote", "à distance", "online", "en ligne")),
            deadline=deadline,
            deadline_confirmed=deadline is not None,
            funding_type=self._infer_funding(body_text),
            monthly_stipend=None,
            monthly_stipend_currency="USD",
            travel_covered=self._nullable_contains(body_text, ("travel covered", "billet", "voyage pris en charge")),
            housing_covered=self._nullable_contains(body_text, ("housing", "logement")),
            tuition_covered=self._nullable_contains(body_text, ("tuition", "frais de scolarité")),
            visa_covered=None,
            insurance_covered=self._nullable_contains(body_text, ("insurance", "assurance")),
            meals_covered=None,
            application_fee=self._contains_any(body_text, ("application fee", "frais de candidature")),
            required_nationality=self._infer_nationality(body_text),
            age_min=None,
            age_max=None,
            required_level=OpportunityRequiredLevel.ANY,
            required_domains=self._infer_domains(body_text),
            required_experience_years=None,
            required_languages=self._infer_languages(body_text),
            required_documents=self._infer_documents(body_text),
            raw_description=self._clean_text(description)[:4000] or self._clean_text(title),
            summary=self._clean_text(description)[:500] or None,
            eligibility_notes=None,
            risks=None if deadline is not None else "Échéance à confirmer depuis la source officielle.",
            candidacy_angle=None,
            collected_at=collected_at,
            expires_at=deadline,
        )

        return ExtractedOpportunityDraft(
            payload=payload,
            canonical_url=official_url,
            content_hash=self._content_hash(official_url, title, description),
            validation_status=self._validation_status(payload),
            validation_notes=self._validation_notes(payload),
        )

    def _json_items(self, parsed_content: Any) -> tuple[dict[str, Any], ...]:
        if isinstance(parsed_content, list):
            return tuple(item for item in parsed_content if isinstance(item, dict))

        if not isinstance(parsed_content, dict):
            return ()

        for key in ("items", "results", "data", "jobs", "opportunities"):
            value = parsed_content.get(key)
            if isinstance(value, list):
                return tuple(item for item in value if isinstance(item, dict))

        return (parsed_content,)

    def _looks_like_opportunity(self, text: str) -> bool:
        normalized_text = text.casefold()

        return len(normalized_text) >= 12 and self._contains_any(normalized_text, OPPORTUNITY_TERMS)

    def _fallback_title(self, soup: BeautifulSoup) -> str:
        heading = soup.find("h1")
        if heading is not None:
            return heading.get_text(" ", strip=True)

        title = soup.find("title")
        return title.get_text(" ", strip=True) if title is not None else ""

    def _infer_type(self, text: str) -> OpportunityType:
        normalized_text = text.casefold()
        mapping = (
            (("bourse", "scholarship"), OpportunityType.SCHOLARSHIP),
            (("stage", "internship"), OpportunityType.INTERNSHIP),
            (("emploi", "job"), OpportunityType.JOB),
            (("fellowship", "programme", "program"), OpportunityType.FELLOWSHIP),
            (("formation", "training"), OpportunityType.TRAINING),
            (("volunteer", "volontariat"), OpportunityType.VOLUNTEER),
        )

        for terms, opportunity_type in mapping:
            if self._contains_any(normalized_text, terms):
                return opportunity_type

        return OpportunityType.TRAINING

    def _infer_funding(self, text: str) -> FundingType:
        normalized_text = text.casefold()

        if self._contains_any(normalized_text, ("entièrement financ", "fully funded", "full scholarship")):
            return FundingType.FULL

        if self._contains_any(normalized_text, ("unpaid", "non financ", "no funding")):
            return FundingType.NONE

        if self._contains_any(normalized_text, ("funded", "financ", "stipend", "allocation", "grant")):
            return FundingType.PARTIAL

        return FundingType.UNKNOWN

    def _infer_domains(self, text: str) -> tuple[str, ...]:
        normalized_text = text.casefold()
        domains: list[str] = []

        if self._contains_any(normalized_text, ("cyber", "sécurité", "security")):
            domains.append("cybersécurité")
        if self._contains_any(normalized_text, ("software", "logiciel", "developer", "développeur")):
            domains.append("logiciel")
        if self._contains_any(normalized_text, ("data", "données", "analytics")):
            domains.append("données")
        if self._contains_any(normalized_text, ("ict", "tic", "informatique", "computer")):
            domains.append("informatique")

        return tuple(dict.fromkeys(domains))

    def _infer_languages(self, text: str) -> tuple[str, ...]:
        languages: list[str] = []

        if self._contains_any(text.casefold(), ("english", "anglais")):
            languages.append("Anglais")
        if self._contains_any(text.casefold(), ("french", "français")):
            languages.append("Français")

        return tuple(languages)

    def _infer_documents(self, text: str) -> tuple[str, ...]:
        documents: list[str] = []

        if self._contains_any(text.casefold(), ("cv", "resume", "résumé")):
            documents.append("CV")
        if self._contains_any(text.casefold(), ("motivation", "cover letter")):
            documents.append("Lettre de motivation")
        if self._contains_any(text.casefold(), ("passport", "passeport")):
            documents.append("Passeport")

        return tuple(documents)

    def _infer_nationality(self, text: str) -> str | None:
        if self._contains_any(text.casefold(), ("african", "afrique", "africains")):
            return "Afrique"

        return None

    def _extract_deadline(self, text: str) -> datetime | None:
        patterns = (
            r"(\d{4}-\d{2}-\d{2})",
            r"(\d{1,2}/\d{1,2}/\d{4})",
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
        )

        for pattern in patterns:
            match = re.search(pattern, text)
            if match is None:
                continue

            parsed_date = self._parse_date(match.group(1))
            if parsed_date is not None:
                return parsed_date

        return None

    def _parse_date(self, value: str) -> datetime | None:
        for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d %B %Y"):
            try:
                return datetime.strptime(value, date_format).replace(tzinfo=timezone.utc)
            except ValueError:
                continue

        return None

    def _nullable_contains(self, text: str, terms: tuple[str, ...]) -> bool | None:
        return True if self._contains_any(text.casefold(), terms) else None

    def _contains_any(self, text: str, terms: tuple[str, ...]) -> bool:
        return any(term in text for term in terms)

    def _validation_status(self, payload: OpportunityCreate) -> ValidationStatus:
        if payload.title and payload.organization and payload.official_url and payload.deadline_confirmed:
            return ValidationStatus.VERIFIED

        return ValidationStatus.NEEDS_REVIEW

    def _validation_notes(self, payload: OpportunityCreate) -> tuple[str, ...]:
        notes: list[str] = []

        if not payload.deadline_confirmed:
            notes.append("Échéance non confirmée")
        if payload.funding_type is FundingType.UNKNOWN:
            notes.append("Financement non confirmé")

        return tuple(notes)

    def _external_id(self, source_name: str, official_url: str, title: str) -> str:
        return hashlib.sha256(f"{source_name}|{official_url}|{title}".encode("utf-8")).hexdigest()[:32]

    def _content_hash(self, official_url: str, title: str, description: str) -> str:
        return hashlib.sha256(f"{official_url}|{title}|{description}".encode("utf-8")).hexdigest()

    def _clean_text(self, value: str) -> str:
        return " ".join(value.strip().split())
