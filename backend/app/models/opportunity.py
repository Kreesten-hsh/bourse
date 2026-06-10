from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.schemas.opportunity import FundingType, OpportunityRequiredLevel, OpportunityStatus, OpportunityType


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        Index("ix_opportunities_external_source", "external_id", "source_name"),
        Index("ix_opportunities_title", "title"),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    external_id: Mapped[str] = mapped_column(String(300), index=True)
    source_name: Mapped[str] = mapped_column(String(120))
    source_url: Mapped[str] = mapped_column(String(1000))
    official_url: Mapped[str] = mapped_column(String(1000))
    title: Mapped[str] = mapped_column(String(500), index=True)
    organization: Mapped[str] = mapped_column(String(300))
    type: Mapped[OpportunityType] = mapped_column(SqlEnum(OpportunityType, native_enum=False))
    destination_country: Mapped[str | None] = mapped_column(String(160), nullable=True)
    destination_city: Mapped[str | None] = mapped_column(String(160), nullable=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline_confirmed: Mapped[bool] = mapped_column(Boolean, default=True)
    funding_type: Mapped[FundingType] = mapped_column(SqlEnum(FundingType, native_enum=False))
    monthly_stipend: Mapped[float | None] = mapped_column(Float, nullable=True)
    monthly_stipend_currency: Mapped[str | None] = mapped_column(String(12), nullable=True, default="USD")
    travel_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    housing_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tuition_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    visa_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    insurance_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    meals_covered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    application_fee: Mapped[bool] = mapped_column(Boolean, default=False)
    required_nationality: Mapped[str | None] = mapped_column(String(240), nullable=True)
    age_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    age_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    required_level: Mapped[OpportunityRequiredLevel] = mapped_column(SqlEnum(OpportunityRequiredLevel, native_enum=False))
    required_domains: Mapped[list[str]] = mapped_column(JSONB, default=list)
    required_experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)
    required_languages: Mapped[list[str]] = mapped_column(JSONB, default=list)
    required_documents: Mapped[list[str]] = mapped_column(JSONB, default=list)
    raw_description: Mapped[str] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    eligibility_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    risks: Mapped[str | None] = mapped_column(Text, nullable=True)
    candidacy_angle: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    score_breakdown: Mapped[dict[str, int]] = mapped_column(JSONB, default=dict)
    status: Mapped[OpportunityStatus] = mapped_column(SqlEnum(OpportunityStatus, native_enum=False), default=OpportunityStatus.NEW)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    duplicate_of_id: Mapped[UUID | None] = mapped_column(
        PgUUID(as_uuid=True),
        ForeignKey("opportunities.id"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
