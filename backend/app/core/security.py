from ipaddress import ip_address
from secrets import compare_digest
from urllib.parse import urlparse

from app.core.config import get_settings


def validate_internal_token(provided_token: str | None) -> bool:
    if provided_token is None:
        return False

    settings = get_settings()
    if settings.secret_key is None:
        return False

    expected_token = settings.secret_key.get_secret_value()

    return compare_digest(provided_token, expected_token)


def validate_public_http_url(value: str) -> str:
    normalized_value = value.strip()
    parsed_url = urlparse(normalized_value)

    if parsed_url.scheme not in {"http", "https"} or parsed_url.hostname is None:
        raise ValueError("source URL must be an HTTP(S) public URL")

    hostname = parsed_url.hostname.casefold()

    if hostname == "localhost" or hostname.endswith(".local"):
        raise ValueError("source URL must be public, not local")

    try:
        parsed_ip = ip_address(hostname)
    except ValueError:
        return normalized_value

    if (
        parsed_ip.is_private
        or parsed_ip.is_loopback
        or parsed_ip.is_link_local
        or parsed_ip.is_reserved
        or parsed_ip.is_multicast
        or parsed_ip.is_unspecified
    ):
        raise ValueError("source URL must be public, not private")

    return normalized_value


def canonicalize_url(value: str) -> str:
    parsed_url = urlparse(value.strip())
    scheme = parsed_url.scheme.casefold()
    hostname = (parsed_url.hostname or "").casefold()
    port = f":{parsed_url.port}" if parsed_url.port is not None else ""
    path = parsed_url.path.rstrip("/") or "/"
    query = f"?{parsed_url.query}" if parsed_url.query else ""

    return f"{scheme}://{hostname}{port}{path}{query}"
