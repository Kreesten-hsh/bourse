from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class NotificationChannel(StrEnum):
    TELEGRAM = "telegram"


class NotificationStatus(StrEnum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class NotificationRead(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    opportunity_id: UUID
    channel: NotificationChannel
    status: NotificationStatus
    message: str = Field(min_length=1)
    sent_at: datetime | None = None
    error: str | None = None

    model_config = ConfigDict(strict=True, frozen=True)
