from app.schemas.opportunity import OpportunityRead
from app.schemas.opportunity import OpportunityStatus
from app.services.collector.ofy_collector import OpportunitiesForYouthCollector
from app.services.collector.reliefweb_collector import ReliefWebCollector
from app.services.collector.untalent_collector import UNTalentCollector
from app.services.opportunity_service import opportunity_service


async def collect_all_sources() -> tuple[OpportunityRead, ...]:
    collectors = (
        ReliefWebCollector(page_limit=1),
        UNTalentCollector(),
        OpportunitiesForYouthCollector(limit=20),
    )
    created_opportunities: tuple[OpportunityRead, ...] = ()

    for collector in collectors:
        result = await collector.collect()
        created = tuple(opportunity_service.create(payload) for payload in result.opportunities)
        created_opportunities = (*created_opportunities, *created)

    return created_opportunities


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
