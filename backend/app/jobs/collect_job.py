from app.core.database import AsyncSessionFactory
from app.schemas.opportunity import OpportunityRead, OpportunityStatus
from app.services.osint_pipeline import osint_pipeline
from app.services.opportunity_service import opportunity_service


async def collect_all_sources() -> tuple[OpportunityRead, ...]:
    async with AsyncSessionFactory() as db:
        existing_opps = await opportunity_service.list(db)
        before_ids = {opportunity.id for opportunity in existing_opps}
        
        await osint_pipeline.collect_due_sources(db)
        
        new_opps = await opportunity_service.list(db)
        return tuple(opportunity for opportunity in new_opps if opportunity.id not in before_ids)


async def deduplicate() -> int:
    return 0


async def archive_expired() -> int:
    archived_count = 0

    async with AsyncSessionFactory() as db:
        opportunities = await opportunity_service.list(db)
        for opportunity in opportunities:
            if opportunity.expires_at is None:
                continue

            await opportunity_service.update_status(db, opportunity.id, OpportunityStatus.ARCHIVED)
            archived_count = archived_count + 1

    return archived_count
