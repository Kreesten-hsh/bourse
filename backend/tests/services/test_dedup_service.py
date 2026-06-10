from app.services.dedup_service import DeduplicationCandidate, detect_duplicate


def test_detect_duplicate_marks_identical_title_and_organization() -> None:
    candidate = DeduplicationCandidate(
        id="first",
        title="CERN Technical Student Programme",
        organization="CERN",
        official_url="https://careers.cern/",
    )
    possible_duplicate = DeduplicationCandidate(
        id="second",
        title="CERN technical student programme",
        organization="CERN",
        official_url="https://jobs.smartrecruiters.com/CERN/",
    )

    result = detect_duplicate(candidate, (possible_duplicate,))

    assert result.is_duplicate is True
    assert result.duplicate_of_id == "second"


def test_detect_duplicate_ignores_unrelated_records() -> None:
    candidate = DeduplicationCandidate(
        id="first",
        title="Mozilla Technology Fund",
        organization="Mozilla Foundation",
        official_url="https://foundation.mozilla.org/",
    )
    unrelated = DeduplicationCandidate(
        id="second",
        title="DAAD EPOS Scholarship",
        organization="DAAD",
        official_url="https://www.daad.de/",
    )

    result = detect_duplicate(candidate, (unrelated,))

    assert result.is_duplicate is False
    assert result.duplicate_of_id is None
