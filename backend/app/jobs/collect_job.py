from app.schemas.opportunity import OpportunityRead
from app.schemas.opportunity import OpportunityStatus
from app.services.osint_pipeline import osint_pipeline
from app.services.opportunity_service import opportunity_service


async def collect_all_sources() -> tuple[OpportunityRead, ...]:
    before_ids = {opportunity.id for opportunity in opportunity_service.list()}
    await osint_pipeline.collect_due_sources()

    return tuple(opportunity for opportunity in opportunity_service.list() if opportunity.id not in before_ids)


async def deduplicate() -> int:
    return 0


async def archive_expired() -> int:
    archived_count = 0

    for opportunity in opportunity_service.list():
        if opportunity.expires_at is None:
            continue

        opportunity_service.update_status(opportunity.id, OpportunityStatus.ARCHIVED)
        archived_count = archived_count + 1

    return archived_count
