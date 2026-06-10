from datetime import datetime, timedelta, timezone

from app.schemas.opportunity import (
    FundingType,
    OpportunityCreate,
    OpportunityRequiredLevel,
    OpportunityStatus,
    OpportunityType,
)
from app.services.opportunity_service import OpportunityService


def make_payload() -> OpportunityCreate:
    now = datetime.now(timezone.utc)

    return OpportunityCreate(
        external_id="daad-epos-2027",
        source_name="manual",
        source_url="https://www.daad.de/",
        official_url="https://www.daad.de/en/study-and-research-in-germany/scholarships/",
        title="DAAD EPOS Development-Related Postgraduate Courses",
        organization="DAAD",
        type=OpportunityType.SCHOLARSHIP,
        destination_country="Germany",
        destination_city=None,
        is_remote=False,
        deadline=now + timedelta(days=90),
        deadline_confirmed=True,
        funding_type=FundingType.FULL,
        monthly_stipend=992.0,
        monthly_stipend_currency="EUR",
        travel_covered=True,
        housing_covered=None,
        tuition_covered=True,
        visa_covered=None,
        insurance_covered=True,
        meals_covered=None,
        application_fee=False,
        required_nationality=None,
        age_min=None,
        age_max=None,
        required_level=OpportunityRequiredLevel.ANY,
        required_domains=("software", "data"),
        required_experience_years=None,
        required_languages=("English",),
        required_documents=("CV", "Motivation letter"),
        raw_description="Official DAAD scholarship page.",
        summary="Fully funded DAAD scholarship route.",
        eligibility_notes="Check degree timing before applying.",
        risks="Some tracks require a completed degree.",
        candidacy_angle="Connect Benin Cyber Shield to development impact.",
        collected_at=now,
        expires_at=None,
    )


def test_opportunity_service_creates_lists_gets_and_updates_status() -> None:
    service = OpportunityService()
    created = service.create(make_payload())

    listed = service.list()
    fetched = service.get(created.id)
    updated = service.update_status(created.id, OpportunityStatus.APPLYING)

    assert listed == (created,)
    assert fetched == created
    assert updated.status is OpportunityStatus.APPLYING
    assert updated.score >= 80
