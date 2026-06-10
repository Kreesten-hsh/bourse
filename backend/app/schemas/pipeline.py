from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.opportunity import OpportunityStatus


class PipelineEntryRead(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    opportunity_id: UUID
    status: OpportunityStatus
    notes: str = ""
    changed_at: datetime

    model_config = ConfigDict(strict=True, frozen=True)
