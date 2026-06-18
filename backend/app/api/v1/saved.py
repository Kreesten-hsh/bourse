from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.opportunity import Opportunity
from app.models.saved_opportunity import SavedOpportunity
from app.schemas.opportunity import OpportunityRead
from app.services.opportunity_service import OpportunityNotFoundError


router = APIRouter(prefix="/api/v1/saved", tags=["saved"])


@router.post("/{opportunity_id}", status_code=status.HTTP_201_CREATED)
async def save_opportunity(opportunity_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    # Check if opportunity exists
    stmt = select(Opportunity).where(Opportunity.id == opportunity_id)
    result = await db.execute(stmt)
    opp = result.scalars().first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if already saved
    stmt = select(SavedOpportunity).where(SavedOpportunity.opportunity_id == opportunity_id)
    result = await db.execute(stmt)
    saved_opp = result.scalars().first()

    if not saved_opp:
        saved_opp = SavedOpportunity(opportunity_id=opportunity_id, saved_at=datetime.now(timezone.utc))
        db.add(saved_opp)
        await db.flush()

    return {"status": "saved"}


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_saved_opportunity(opportunity_id: UUID, db: AsyncSession = Depends(get_db)) -> None:
    stmt = select(SavedOpportunity).where(SavedOpportunity.opportunity_id == opportunity_id)
    result = await db.execute(stmt)
    saved_opp = result.scalars().first()

    if saved_opp:
        await db.delete(saved_opp)
        await db.flush()


@router.get("", response_model=tuple[OpportunityRead, ...])
async def list_saved_opportunities(db: AsyncSession = Depends(get_db)) -> tuple[OpportunityRead, ...]:
    stmt = (
        select(Opportunity)
        .join(SavedOpportunity, Opportunity.id == SavedOpportunity.opportunity_id)
        .order_by(desc(SavedOpportunity.saved_at))
    )
    result = await db.execute(stmt)
    opportunities = result.scalars().all()

    return tuple(OpportunityRead.model_validate(opp, from_attributes=True) for opp in opportunities)
