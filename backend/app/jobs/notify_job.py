from app.core.database import AsyncSessionFactory
from app.notifications.telegram_notifier import TelegramNotifier
from app.schemas.opportunity import OpportunityRead
from app.services.opportunity_service import opportunity_service


async def send_daily_digest() -> int:
    notifier = TelegramNotifier()
    
    async with AsyncSessionFactory() as db:
        opportunities = await opportunity_service.list(db)
        priority_opportunities = tuple(
            opportunity for opportunity in opportunities if opportunity.score >= 60 and opportunity.status.value != "archived"
        )

        if not priority_opportunities:
            return 0

        await notifier.send_digest(priority_opportunities)

    return len(priority_opportunities)


async def send_priority_notification(opportunity: OpportunityRead) -> bool:
    if opportunity.score < 80:
        return False

    notifier = TelegramNotifier()
    await notifier.send_opportunity(opportunity)

    return True
