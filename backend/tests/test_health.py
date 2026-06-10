from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_returns_service_status() -> None:
    client = TestClient(create_app())

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "service": "to the world API",
        "version": "0.1.0",
        "environment": "local",
        "status": "ok",
    }


def test_versioned_health_endpoint_returns_service_status() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
