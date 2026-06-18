from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.opportunity import OpportunityRead, OpportunityStatus
from app.services.opportunity_service import opportunity_service


router = APIRouter(prefix="/api/v1/pipeline", tags=["pipeline"])


@router.get("", response_model=dict[OpportunityStatus, tuple[OpportunityRead, ...]])
async def list_pipeline(db: AsyncSession = Depends(get_db)) -> dict[OpportunityStatus, tuple[OpportunityRead, ...]]:
    opportunities = await opportunity_service.list(db)

    return {
        status: tuple(opportunity for opportunity in opportunities if opportunity.status is status)
        for status in OpportunityStatus
    }
