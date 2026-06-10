from functools import lru_cache

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "to the world API"
    app_version: str = "0.1.0"
    environment: str = Field(default="local")
    debug: bool = False
    enable_docs: bool = True
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/totheworld"
    redis_url: str = "redis://localhost:6379/0"
    telegram_bot_token: SecretStr | None = None
    telegram_chat_id: str | None = None
    reliefweb_app_name: str = "to-the-world-kreesten"
    secret_key: SecretStr | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
