from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.opportunity import FundingType, OpportunityRequiredLevel


class ScoringOpportunity(BaseModel):
    funding_type: FundingType
    monthly_stipend: float | None = Field(default=None, ge=0)
    required_nationality: str | None = None
    required_domains: tuple[str, ...] = Field(default_factory=tuple)
    required_level: OpportunityRequiredLevel
    deadline: datetime | None = None
    deadline_confirmed: bool
    travel_covered: bool | None = None
    housing_covered: bool | None = None
    application_fee: bool

    model_config = ConfigDict(strict=True, frozen=True)


class ScoreResult(BaseModel):
    score: int = Field(ge=0, le=100)
    breakdown: dict[str, int]

    model_config = ConfigDict(strict=True, frozen=True)


TECHNICAL_TERMS = ("informatique", "cybersécurité", "cybersecurite", "software", "data")
GLOBAL_NATIONALITY_TERMS = ("benin", "bénin", "afrique", "africa", "global", "international", "worldwide")


def calculate_opportunity_score(opportunity: ScoringOpportunity) -> ScoreResult:
    positive_breakdown = {
        **score_funding_support(opportunity),
        **score_accessibility(opportunity),
        **score_deadline(opportunity),
        **score_practical_support(opportunity),
    }
    negative_breakdown = score_blockers(opportunity)
    breakdown = {**positive_breakdown, **negative_breakdown}
    raw_score = sum(breakdown.values())

    return ScoreResult(score=min(100, max(0, raw_score)), breakdown=breakdown)


def score_funding_support(opportunity: ScoringOpportunity) -> dict[str, int]:
    return {
        "funding_full": 30 if opportunity.funding_type is FundingType.FULL else 0,
        "monthly_stipend": 20 if opportunity.monthly_stipend is not None and opportunity.monthly_stipend > 0 else 0,
    }


def score_accessibility(opportunity: ScoringOpportunity) -> dict[str, int]:
    return {
        "global_nationality": 20 if opportunity.required_nationality is None else 0,
        "technical_domain": 15 if has_technical_domain(opportunity.required_domains) else 0,
        "undergrad_level": 10 if opportunity.required_level in UNDERGRAD_LEVELS else 0,
    }


def score_deadline(opportunity: ScoringOpportunity) -> dict[str, int]:
    deadline_is_open = opportunity.deadline_confirmed is False or deadline_is_more_than_14_days(opportunity.deadline)

    return {
        "deadline_window": 10 if deadline_is_open else 0,
    }


def score_practical_support(opportunity: ScoringOpportunity) -> dict[str, int]:
    return {
        "travel_covered": 5 if opportunity.travel_covered is True else 0,
        "housing_covered": 5 if opportunity.housing_covered is True else 0,
    }


def score_blockers(opportunity: ScoringOpportunity) -> dict[str, int]:
    return {
        "application_fee": -50 if opportunity.application_fee is True else 0,
        "restrictive_nationality": -40 if has_restrictive_nationality(opportunity.required_nationality) else 0,
        "advanced_degree_required": -30 if opportunity.required_level in ADVANCED_LEVELS else 0,
        "no_funding": -20 if opportunity.funding_type is FundingType.NONE else 0,
        "unconfirmed_deadline": -10 if opportunity.deadline_confirmed is False else 0,
    }


def has_technical_domain(required_domains: tuple[str, ...]) -> bool:
    normalized_domains = " ".join(required_domains).lower()

    return any(term in normalized_domains for term in TECHNICAL_TERMS)


def deadline_is_more_than_14_days(deadline: datetime | None) -> bool:
    if deadline is None:
        return False

    normalized_deadline = deadline if deadline.tzinfo is not None else deadline.replace(tzinfo=timezone.utc)
    remaining_days = (normalized_deadline - datetime.now(timezone.utc)).days

    return remaining_days > 14


def has_restrictive_nationality(required_nationality: str | None) -> bool:
    if required_nationality is None:
        return False

    normalized_nationality = required_nationality.lower()

    return not any(term in normalized_nationality for term in GLOBAL_NATIONALITY_TERMS)


UNDERGRAD_LEVELS = frozenset((OpportunityRequiredLevel.UNDERGRAD, OpportunityRequiredLevel.ANY))
ADVANCED_LEVELS = frozenset((OpportunityRequiredLevel.MASTERS, OpportunityRequiredLevel.PHD))
