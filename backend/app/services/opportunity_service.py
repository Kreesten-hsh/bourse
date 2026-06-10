from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas.opportunity import OpportunityCreate, OpportunityRead, OpportunityStatus
from app.services.scoring_service import ScoringOpportunity, calculate_opportunity_score


class OpportunityNotFoundError(LookupError):
    pass


class OpportunityService:
    def __init__(self, initial_opportunities: tuple[OpportunityRead, ...] = ()) -> None:
        self._opportunities = {opportunity.id: opportunity for opportunity in initial_opportunities}

    def list(self) -> tuple[OpportunityRead, ...]:
        return tuple(
            sorted(
                self._opportunities.values(),
                key=lambda opportunity: (opportunity.score, opportunity.created_at),
                reverse=True,
            )
        )

    def get(self, opportunity_id: UUID) -> OpportunityRead:
        opportunity = self._opportunities.get(opportunity_id)

        if opportunity is None:
            raise OpportunityNotFoundError(str(opportunity_id))

        return opportunity

    def create(self, payload: OpportunityCreate) -> OpportunityRead:
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
        opportunity = OpportunityRead(
            **payload.model_dump(),
            id=uuid4(),
            score=score_result.score,
            score_breakdown=score_result.breakdown,
            status=OpportunityStatus.NEW,
            is_duplicate=False,
            duplicate_of_id=None,
            created_at=now,
            updated_at=now,
        )
        self._opportunities = {**self._opportunities, opportunity.id: opportunity}

        return opportunity

    def update_status(self, opportunity_id: UUID, status: OpportunityStatus) -> OpportunityRead:
        opportunity = self.get(opportunity_id)
        updated_opportunity = opportunity.model_copy(update={"status": status, "updated_at": datetime.now(timezone.utc)})
        self._opportunities = {**self._opportunities, opportunity_id: updated_opportunity}

        return updated_opportunity


opportunity_service = OpportunityService()
