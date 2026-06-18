from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def create_engine_from_settings() -> object:
    settings = get_settings()

    return create_async_engine(
        settings.database_url,
        pool_pre_ping=True,
        future=True,
    )


async_engine = create_engine_from_settings()
AsyncSessionFactory = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
    autoflush=False,
)


async def init_db() -> None:
    # Importer les modèles pour qu'ils soient enregistrés
    from app.models.collection_run import CollectionRun
    from app.models.opportunity import Opportunity
    from app.models.saved_opportunity import SavedOpportunity
    from app.models.source import Source
    from app.services.source_registry_service import DEFAULT_OSINT_SOURCES, source_registry_service

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialisation des sources par défaut
    async with AsyncSessionFactory() as session:
        for source_data in DEFAULT_OSINT_SOURCES:
            try:
                await source_registry_service.create(session, source_data)
            except ValueError:
                # Ignore DuplicateSourceError
                pass


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionFactory() as session:
        yield session
