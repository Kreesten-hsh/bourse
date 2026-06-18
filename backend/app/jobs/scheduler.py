import logging
from collections.abc import Callable, Awaitable
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.jobs.collect_job import archive_expired, collect_all_sources, deduplicate
from app.jobs.notify_job import send_daily_digest


logger = logging.getLogger(__name__)


def logged_job(job_name: str, func: Callable[[], Awaitable[Any]]) -> Callable[[], Awaitable[Any]]:
    async def wrapper() -> Any:
        logger.info(f"Démarrage du job: {job_name}")
        try:
            result = await func()
            logger.info(f"Fin du job: {job_name} avec succès.")
            return result
        except Exception as e:
            logger.error(f"Erreur dans le job {job_name}: {e}")
            raise
    return wrapper


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(logged_job("collect_all_sources", collect_all_sources), "cron", hour=6, minute=0, id="collect_all_sources", replace_existing=True)
    scheduler.add_job(logged_job("send_daily_digest", send_daily_digest), "cron", hour=7, minute=0, id="send_daily_digest", replace_existing=True)
    scheduler.add_job(logged_job("archive_expired", archive_expired), "cron", hour=0, minute=0, id="archive_expired", replace_existing=True)
    scheduler.add_job(logged_job("deduplicate", deduplicate), "cron", hour=6, minute=30, id="deduplicate_after_collect", replace_existing=True)

    return scheduler
