from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field
from pydantic import field_validator

from app.core.security import validate_public_http_url


class SourceType(StrEnum):
    API = "api"
    RSS = "rss"
    SCRAPER = "scraper"
    MANUAL = "manual"


class SourceStatus(StrEnum):
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"


class SourceFrequency(StrEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    MANUAL = "manual"


class SourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    url: str = Field(min_length=1, max_length=1000)
    type: SourceType = SourceType.SCRAPER
    frequency: SourceFrequency = SourceFrequency.WEEKLY
    adapter_key: str = Field(default="generic_html", min_length=1, max_length=80)
    is_active: bool = True

    model_config = ConfigDict(strict=True, frozen=True)

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return validate_public_http_url(value)


class SourceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    url: str | None = Field(default=None, min_length=1, max_length=1000)
    type: SourceType | None = None
    frequency: SourceFrequency | None = None
    adapter_key: str | None = Field(default=None, min_length=1, max_length=80)
    is_active: bool | None = None
    status: SourceStatus | None = None

    model_config = ConfigDict(strict=True, frozen=True)

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        if value is None:
            return value

        return validate_public_http_url(value)


class SourceRead(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(min_length=1, max_length=120)
    url: str = Field(min_length=1, max_length=1000)
    type: SourceType
    frequency: SourceFrequency = SourceFrequency.WEEKLY
    adapter_key: str = Field(default="generic_html", min_length=1, max_length=80)
    is_active: bool = True
    status: SourceStatus = SourceStatus.ENABLED
    last_sync_at: datetime | None = None
    last_result_count: int = Field(default=0, ge=0)
    last_error: str | None = None

    model_config = ConfigDict(strict=True, frozen=True)
