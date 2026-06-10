from secrets import compare_digest

from app.core.config import get_settings


def validate_internal_token(provided_token: str | None) -> bool:
    if provided_token is None:
        return False

    settings = get_settings()
    if settings.secret_key is None:
        return False

    expected_token = settings.secret_key.get_secret_value()

    return compare_digest(provided_token, expected_token)
