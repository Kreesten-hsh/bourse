from collections.abc import AsyncIterator

from redis.asyncio import Redis

from app.core.config import get_settings


def create_redis_client() -> Redis:
    settings = get_settings()

    return Redis.from_url(settings.redis_url, decode_responses=True)


async def get_redis_client() -> AsyncIterator[Redis]:
    client = create_redis_client()

    try:
        yield client
    finally:
        await client.aclose()
