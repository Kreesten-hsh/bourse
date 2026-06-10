from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class SourceType(StrEnum):
    API = "api"
    RSS = "rss"
    SCRAPER = "scraper"
    MANUAL = "manual"


class SourceStatus(StrEnum):
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"


class SourceRead(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(min_length=1, max_length=120)
    url: str = Field(min_length=1, max_length=1000)
    type: SourceType
    status: SourceStatus = SourceStatus.ENABLED
    last_sync_at: datetime | None = None
    last_result_count: int = Field(default=0, ge=0)
    last_error: str | None = None

    model_config = ConfigDict(strict=True, frozen=True)
