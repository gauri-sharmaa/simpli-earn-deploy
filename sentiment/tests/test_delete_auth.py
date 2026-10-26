from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import api


class FakeAuth:
    def __init__(self, users):
        self.users = users

    def get_user(self, token):
        if token not in self.users:
            raise Exception("invalid token")
        return SimpleNamespace(user=self.users[token])


class FakeStorageBucket:
    def __init__(self, removed):
        self.removed = removed

    def remove(self, names):
        self.removed.extend(names)


class FakeSupabase:
    def __init__(self, users):
        self.auth = FakeAuth(users)
        self.removed = []


    @property
    def storage(self):
        return SimpleNamespace(from_=lambda bucket: FakeStorageBucket(self.removed))


@pytest.fixture
def client(monkeypatch):
    fake = FakeSupabase(
        {
            "admin-token": SimpleNamespace(id="admin-id", email="Admin@Example.com"),
            "user-token": SimpleNamespace(id="user-id", email="user@example.com"),
        }
    )
    monkeypatch.setattr(api, "supabase", fake)
    monkeypatch.setenv("DASHBOARD_ADMIN_EMAILS", "admin@example.com")
    monkeypatch.delenv("DASHBOARD_ADMIN_USER_IDS", raising=False)
    return TestClient(api.app), fake


def test_delete_requires_sign_in(client):
    http, fake = client
    assert http.delete("/sentiment/results.csv").status_code == 401
    assert http.delete("/library/abc").status_code == 401
    assert fake.removed == []


def test_delete_rejects_bad_token_and_non_admin(client):
    http, fake = client
    assert http.delete("/sentiment/results.csv", headers={"Authorization": "Bearer nope"}).status_code == 401
    assert http.delete("/sentiment/results.csv", headers={"Authorization": "Bearer user-token"}).status_code == 403
    assert fake.removed == []


def test_admin_can_delete(client):
    http, fake = client
    response = http.delete("/sentiment/results.csv", headers={"Authorization": "Bearer admin-token"})
    assert response.status_code == 200
    assert fake.removed == ["results.csv"]
