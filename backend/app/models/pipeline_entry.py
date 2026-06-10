from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.schemas.opportunity import OpportunityStatus


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PipelineEntry(Base):
    __tablename__ = "pipeline_entries"

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    opportunity_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), ForeignKey("opportunities.id"))
    status: Mapped[OpportunityStatus] = mapped_column(SqlEnum(OpportunityStatus, native_enum=False))
    notes: Mapped[str] = mapped_column(String(2000), default="")
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
