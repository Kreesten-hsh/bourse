from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.schemas.opportunity import OpportunityRead, OpportunityStatus, OpportunityStatusUpdate
from app.services.opportunity_service import OpportunityNotFoundError, opportunity_service


router = APIRouter(prefix="/api/v1/opportunities", tags=["opportunities"])


@router.get("", response_model=tuple[OpportunityRead, ...])
async def list_opportunities(
    status: OpportunityStatus | None = Query(default=None),
    minimum_score: int | None = Query(default=None, ge=0, le=100),
) -> tuple[OpportunityRead, ...]:
    opportunities = opportunity_service.list()

    if status is not None:
        opportunities = tuple(opportunity for opportunity in opportunities if opportunity.status is status)

    if minimum_score is not None:
        opportunities = tuple(opportunity for opportunity in opportunities if opportunity.score >= minimum_score)

    return opportunities


@router.get("/{opportunity_id}", response_model=OpportunityRead)
async def get_opportunity(opportunity_id: UUID) -> OpportunityRead:
    try:
        return opportunity_service.get(opportunity_id)
    except OpportunityNotFoundError as error:
        raise HTTPException(status_code=404, detail="Opportunity not found") from error


@router.patch("/{opportunity_id}/status", response_model=OpportunityRead)
async def update_opportunity_status(opportunity_id: UUID, payload: OpportunityStatusUpdate) -> OpportunityRead:
    try:
        return opportunity_service.update_status(opportunity_id, payload.status)
    except OpportunityNotFoundError as error:
        raise HTTPException(status_code=404, detail="Opportunity not found") from error
