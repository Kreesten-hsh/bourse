from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.schemas.notification import NotificationChannel, NotificationStatus


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    opportunity_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("opportunities.id"))
    channel: Mapped[NotificationChannel] = mapped_column(SqlEnum(NotificationChannel, native_enum=False))
    status: Mapped[NotificationStatus] = mapped_column(SqlEnum(NotificationStatus, native_enum=False))
    message: Mapped[str] = mapped_column(Text)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error: Mapped[str | None] = mapped_column(String(1000), nullable=True)
