from fastapi.testclient import TestClient

from app.main import create_app


def test_v1_health_route_is_registered() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["service"] == "to the world API"
