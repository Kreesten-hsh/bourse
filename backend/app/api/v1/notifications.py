from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.jobs.notify_job import send_daily_digest


class DigestResult(BaseModel):
    sent_count: int = Field(ge=0)

    model_config = ConfigDict(strict=True, frozen=True)


router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.post("/daily-digest", response_model=DigestResult)
async def trigger_daily_digest() -> DigestResult:
    sent_count = await send_daily_digest()

    return DigestResult(sent_count=sent_count)
