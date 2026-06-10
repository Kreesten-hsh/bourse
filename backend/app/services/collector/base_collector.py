from abc import ABC, abstractmethod

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.opportunity import OpportunityCreate


class CollectorResult(BaseModel):
    source_name: str = Field(min_length=1)
    opportunities: tuple[OpportunityCreate, ...]

    model_config = ConfigDict(strict=True, frozen=True)


class BaseCollector(ABC):
    source_name: str

    @abstractmethod
    async def collect(self) -> CollectorResult:
        raise NotImplementedError
