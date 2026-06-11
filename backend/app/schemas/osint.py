from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.opportunity import OpportunityCreate


class ValidationStatus(StrEnum):
    VERIFIED = "verified"
    NEEDS_REVIEW = "needs_review"
    REJECTED = "rejected"


class CollectionRunStatus(StrEnum):
    COMPLETED = "completed"
    FAILED = "failed"


class FetchedDocument(BaseModel):
    url: str = Field(min_length=1, max_length=1000)
    status_code: int = Field(ge=100, le=599)
    content_type: str = Field(default="", max_length=160)
    content: str
    fetched_at: datetime

    model_config = ConfigDict(strict=True, frozen=True)


class ExtractedOpportunityDraft(BaseModel):
    payload: OpportunityCreate
    canonical_url: str = Field(min_length=1, max_length=1000)
    content_hash: str = Field(min_length=16, max_length=128)
    validation_status: ValidationStatus
    validation_notes: tuple[str, ...] = Field(default_factory=tuple)

    model_config = ConfigDict(strict=True, frozen=True)


class CollectionRunRead(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    source_id: UUID
    source_name: str = Field(min_length=1, max_length=120)
    started_at: datetime
    finished_at: datetime
    status: CollectionRunStatus
    pages_seen: int = Field(ge=0)
    items_found: int = Field(ge=0)
    items_created: int = Field(ge=0)
    items_updated: int = Field(ge=0)
    duplicates_skipped: int = Field(ge=0)
    error: str | None = None

    model_config = ConfigDict(strict=True, frozen=True)
