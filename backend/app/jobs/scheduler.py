from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.jobs.collect_job import archive_expired, collect_all_sources, deduplicate
from app.jobs.notify_job import send_daily_digest


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(collect_all_sources, "cron", hour=6, minute=0, id="collect_all_sources", replace_existing=True)
    scheduler.add_job(send_daily_digest, "cron", hour=7, minute=0, id="send_daily_digest", replace_existing=True)
    scheduler.add_job(archive_expired, "cron", hour=0, minute=0, id="archive_expired", replace_existing=True)
    scheduler.add_job(deduplicate, "cron", hour=6, minute=30, id="deduplicate_after_collect", replace_existing=True)

    return scheduler
