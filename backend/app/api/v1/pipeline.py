from fastapi import APIRouter

from app.schemas.opportunity import OpportunityRead, OpportunityStatus
from app.services.opportunity_service import opportunity_service


router = APIRouter(prefix="/api/v1/pipeline", tags=["pipeline"])


@router.get("", response_model=dict[OpportunityStatus, tuple[OpportunityRead, ...]])
async def list_pipeline() -> dict[OpportunityStatus, tuple[OpportunityRead, ...]]:
    opportunities = opportunity_service.list()

    return {
        status: tuple(opportunity for opportunity in opportunities if opportunity.status is status)
        for status in OpportunityStatus
    }
