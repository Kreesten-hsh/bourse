from datetime import datetime, timedelta, timezone

import pytest

from app.schemas.opportunity import FundingType, OpportunityRequiredLevel
from app.services.scoring_service import (
    ScoringOpportunity,
    calculate_opportunity_score,
)


def base_candidate() -> ScoringOpportunity:
    return ScoringOpportunity(
        funding_type=FundingType.UNKNOWN,
        monthly_stipend=None,
        required_nationality="Benin",
        required_domains=("public policy",),
        required_level=OpportunityRequiredLevel.PROFESSIONAL,
        deadline=datetime.now(timezone.utc) + timedelta(days=7),
        deadline_confirmed=True,
        travel_covered=False,
        housing_covered=False,
        application_fee=False,
    )


@pytest.mark.parametrize(
    ("candidate", "breakdown_key", "expected_delta"),
    [
        (base_candidate().model_copy(update={"funding_type": FundingType.FULL}), "funding_full", 30),
        (base_candidate().model_copy(update={"monthly_stipend": 450.0}), "monthly_stipend", 20),
        (base_candidate().model_copy(update={"required_nationality": None}), "global_nationality", 20),
        (base_candidate().model_copy(update={"required_domains": ("software",)}), "technical_domain", 15),
        (base_candidate().model_copy(update={"required_level": OpportunityRequiredLevel.UNDERGRAD}), "undergrad_level", 10),
        (
            base_candidate().model_copy(update={"deadline": datetime.now(timezone.utc) + timedelta(days=21)}),
            "deadline_window",
            10,
        ),
        (base_candidate().model_copy(update={"travel_covered": True}), "travel_covered", 5),
        (base_candidate().model_copy(update={"housing_covered": True}), "housing_covered", 5),
        (base_candidate().model_copy(update={"application_fee": True}), "application_fee", -50),
        (
            base_candidate().model_copy(update={"required_nationality": "United States citizens only"}),
            "restrictive_nationality",
            -40,
        ),
        (
            base_candidate().model_copy(update={"required_level": OpportunityRequiredLevel.MASTERS}),
            "advanced_degree_required",
            -30,
        ),
        (base_candidate().model_copy(update={"funding_type": FundingType.NONE}), "no_funding", -20),
    ],
)
def test_scoring_service_exposes_each_weight(
    candidate: ScoringOpportunity,
    breakdown_key: str,
    expected_delta: int,
) -> None:
    result = calculate_opportunity_score(candidate)

    assert result.breakdown[breakdown_key] == expected_delta


def test_unconfirmed_deadline_gets_bonus_and_penalty() -> None:
    candidate = base_candidate().model_copy(update={"deadline": None, "deadline_confirmed": False})

    result = calculate_opportunity_score(candidate)

    assert result.breakdown["deadline_window"] == 10
    assert result.breakdown["unconfirmed_deadline"] == -10
    assert result.score == 0


def test_score_is_capped_to_100() -> None:
    candidate = ScoringOpportunity(
        funding_type=FundingType.FULL,
        monthly_stipend=900.0,
        required_nationality=None,
        required_domains=("cybersécurité", "data"),
        required_level=OpportunityRequiredLevel.ANY,
        deadline=datetime.now(timezone.utc) + timedelta(days=45),
        deadline_confirmed=True,
        travel_covered=True,
        housing_covered=True,
        application_fee=False,
    )

    result = calculate_opportunity_score(candidate)

    assert result.score == 100
