from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OpportunityType(StrEnum):
    SCHOLARSHIP = "scholarship"
    INTERNSHIP = "internship"
    JOB = "job"
    FELLOWSHIP = "fellowship"
    TRAINING = "training"
    VOLUNTEER = "volunteer"


class FundingType(StrEnum):
    FULL = "full"
    PARTIAL = "partial"
    NONE = "none"
    UNKNOWN = "unknown"


class OpportunityRequiredLevel(StrEnum):
    UNDERGRAD = "undergrad"
    MASTERS = "masters"
    PHD = "phd"
    PROFESSIONAL = "professional"
    ANY = "any"


class OpportunityStatus(StrEnum):
    NEW = "new"
    ANALYZING = "analyzing"
    PRIORITY = "priority"
    APPLYING = "applying"
    APPLIED = "applied"
    RESULT = "result"
    ARCHIVED = "archived"


class OpportunityBase(BaseModel):
    external_id: str = Field(min_length=1, max_length=300)
    source_name: str = Field(min_length=1, max_length=120)
    source_url: str = Field(min_length=1, max_length=1000)
    official_url: str = Field(min_length=1, max_length=1000)
    title: str = Field(min_length=1, max_length=500)
    organization: str = Field(min_length=1, max_length=300)
    type: OpportunityType
    destination_country: str | None = Field(default=None, max_length=160)
    destination_city: str | None = Field(default=None, max_length=160)
    is_remote: bool = False
    deadline: datetime | None = None
    deadline_confirmed: bool = True
    funding_type: FundingType = FundingType.UNKNOWN
    monthly_stipend: float | None = Field(default=None, ge=0)
    monthly_stipend_currency: str | None = Field(default="USD", max_length=12)
    travel_covered: bool | None = None
    housing_covered: bool | None = None
    tuition_covered: bool | None = None
    visa_covered: bool | None = None
    insurance_covered: bool | None = None
    meals_covered: bool | None = None
    application_fee: bool = False
    required_nationality: str | None = Field(default=None, max_length=240)
    age_min: int | None = Field(default=None, ge=0, le=120)
    age_max: int | None = Field(default=None, ge=0, le=120)
    required_level: OpportunityRequiredLevel = OpportunityRequiredLevel.ANY
    required_domains: tuple[str, ...] = Field(default_factory=tuple)
    required_experience_years: int | None = Field(default=None, ge=0, le=60)
    required_languages: tuple[str, ...] = Field(default_factory=tuple)
    required_documents: tuple[str, ...] = Field(default_factory=tuple)
    raw_description: str = Field(min_length=1)
    summary: str | None = None
    eligibility_notes: str | None = None
    risks: str | None = None
    candidacy_angle: str | None = None
    collected_at: datetime
    expires_at: datetime | None = None

    model_config = ConfigDict(strict=True, frozen=True)

    @field_validator("age_max")
    @classmethod
    def validate_age_window(cls, age_max: int | None, info: object) -> int | None:
        data = getattr(info, "data", {})
        age_min = data.get("age_min") if isinstance(data, dict) else None

        if age_min is None or age_max is None:
            return age_max

        if age_max < age_min:
            raise ValueError("age_max must be greater than or equal to age_min")

        return age_max


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityStatusUpdate(BaseModel):
    status: OpportunityStatus

    model_config = ConfigDict(strict=True, frozen=True)


class OpportunityRead(OpportunityBase):
    id: UUID = Field(default_factory=uuid4)
    score: int = Field(ge=0, le=100)
    score_breakdown: dict[str, int] = Field(default_factory=dict)
    status: OpportunityStatus = OpportunityStatus.NEW
    is_duplicate: bool = False
    duplicate_of_id: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(strict=True, frozen=True)
