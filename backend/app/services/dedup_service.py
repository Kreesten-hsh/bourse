from difflib import SequenceMatcher

from pydantic import BaseModel, ConfigDict, Field


class DeduplicationCandidate(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    organization: str = Field(min_length=1)
    official_url: str = Field(min_length=1)

    model_config = ConfigDict(strict=True, frozen=True)


class DeduplicationResult(BaseModel):
    is_duplicate: bool
    duplicate_of_id: str | None
    confidence: float = Field(ge=0, le=1)

    model_config = ConfigDict(strict=True, frozen=True)


def detect_duplicate(
    candidate: DeduplicationCandidate,
    existing_candidates: tuple[DeduplicationCandidate, ...],
) -> DeduplicationResult:
    matches = tuple(
        build_match_result(candidate, existing_candidate)
        for existing_candidate in existing_candidates
        if candidate.id != existing_candidate.id
    )
    duplicate_matches = tuple(match for match in matches if match.confidence >= 0.92)

    if not duplicate_matches:
        return DeduplicationResult(is_duplicate=False, duplicate_of_id=None, confidence=0)

    best_match = max(duplicate_matches, key=lambda match: match.confidence)

    return best_match


def build_match_result(
    candidate: DeduplicationCandidate,
    existing_candidate: DeduplicationCandidate,
) -> DeduplicationResult:
    identity_score = similarity(normalize(candidate.title), normalize(existing_candidate.title))
    organization_score = similarity(normalize(candidate.organization), normalize(existing_candidate.organization))
    url_score = 1.0 if normalize_url(candidate.official_url) == normalize_url(existing_candidate.official_url) else 0.0
    confidence = max((identity_score * 0.7) + (organization_score * 0.3), url_score)

    return DeduplicationResult(
        is_duplicate=confidence >= 0.92,
        duplicate_of_id=existing_candidate.id if confidence >= 0.92 else None,
        confidence=round(confidence, 4),
    )


def normalize(value: str) -> str:
    return " ".join(value.casefold().strip().split())


def normalize_url(value: str) -> str:
    return value.casefold().removesuffix("/").replace("https://", "").replace("http://", "")


def similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, left, right).ratio()
