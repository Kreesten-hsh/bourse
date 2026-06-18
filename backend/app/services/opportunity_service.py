from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import Opportunity
from app.schemas.opportunity import OpportunityCreate, OpportunityRead, OpportunityStatus
from app.services.scoring_service import ScoringOpportunity, calculate_opportunity_score


class OpportunityNotFoundError(LookupError):
    pass


class OpportunityService:
    async def list(self, db: AsyncSession) -> tuple[OpportunityRead, ...]:
        stmt = select(Opportunity).order_by(desc(Opportunity.score), desc(Opportunity.created_at))
        result = await db.execute(stmt)
        opportunities = result.scalars().all()
        
        return tuple(OpportunityRead.model_validate(opp, from_attributes=True) for opp in opportunities)

    async def get(self, db: AsyncSession, opportunity_id: UUID) -> OpportunityRead:
        stmt = select(Opportunity).where(Opportunity.id == opportunity_id)
        result = await db.execute(stmt)
        opportunity = result.scalars().first()

        if opportunity is None:
            raise OpportunityNotFoundError(str(opportunity_id))

        return OpportunityRead.model_validate(opportunity, from_attributes=True)

    async def create(self, db: AsyncSession, payload: OpportunityCreate) -> OpportunityRead:
        now = datetime.now(timezone.utc)
        scoring_input = ScoringOpportunity(
            funding_type=payload.funding_type,
            monthly_stipend=payload.monthly_stipend,
            required_nationality=payload.required_nationality,
            required_domains=payload.required_domains,
            required_level=payload.required_level,
            deadline=payload.deadline,
            deadline_confirmed=payload.deadline_confirmed,
            travel_covered=payload.travel_covered,
            housing_covered=payload.housing_covered,
            application_fee=payload.application_fee,
        )
        score_result = calculate_opportunity_score(scoring_input)
        
        opportunity_data = payload.model_dump()
        opportunity = Opportunity(
            **opportunity_data,
            id=uuid4(),
            score=score_result.score,
            score_breakdown=score_result.breakdown,
            status=OpportunityStatus.NEW,
            is_duplicate=False,
            duplicate_of_id=None,
            created_at=now,
            updated_at=now,
            collected_at=payload.collected_at or now,
        )
        db.add(opportunity)
        await db.flush()
        
        return OpportunityRead.model_validate(opportunity, from_attributes=True)

    async def update_status(self, db: AsyncSession, opportunity_id: UUID, status: OpportunityStatus) -> OpportunityRead:
        stmt = select(Opportunity).where(Opportunity.id == opportunity_id)
        result = await db.execute(stmt)
        opportunity = result.scalars().first()

        if opportunity is None:
            raise OpportunityNotFoundError(str(opportunity_id))

        opportunity.status = status
        opportunity.updated_at = datetime.now(timezone.utc)
        await db.flush()

        return OpportunityRead.model_validate(opportunity, from_attributes=True)


opportunity_service = OpportunityService()
