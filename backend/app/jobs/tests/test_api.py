import pytest
from django.db import IntegrityError
from rest_framework.test import APIClient

from jobs.enums import JobStatusType
from jobs.services import create_job, update_job_status


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
class TestListJobs:
    def test_returns_empty_list(self, api_client: APIClient):
        resp = api_client.get("/api/jobs/")
        assert resp.status_code == 200
        assert resp.json()["results"] == []
        assert resp.json()["count"] == 0

    def test_returns_jobs_with_current_status(self, api_client: APIClient):
        job = create_job(name="List Test")
        resp = api_client.get("/api/jobs/")

        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 1
        assert data["results"][0]["name"] == "List Test"
        assert data["results"][0]["current_status_type"] == "PENDING"

    def test_filters_by_status(self, api_client: APIClient):
        create_job(name="Pending Job")
        running_job = create_job(name="Running Job")
        update_job_status(job=running_job, new_status=JobStatusType.RUNNING)

        resp = api_client.get("/api/jobs/", {"status": "RUNNING"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 1
        assert data["results"][0]["name"] == "Running Job"

    def test_rejects_invalid_status_filter(self, api_client: APIClient):
        resp = api_client.get("/api/jobs/", {"status": "INVALID"})
        assert resp.status_code == 400

    def test_sorts_by_name(self, api_client: APIClient):
        create_job(name="Bravo")
        create_job(name="Alpha")

        resp = api_client.get("/api/jobs/", {"sort": "name"})

        names = [j["name"] for j in resp.json()["results"]]
        assert names == ["Alpha", "Bravo"]

    def test_pagination_limits_results(self, api_client: APIClient):
        for i in range(5):
            create_job(name=f"Job {i}")

        resp = api_client.get("/api/jobs/", {"limit": 2, "offset": 0})
        data = resp.json()

        assert data["count"] == 5
        assert len(data["results"]) == 2
        assert data["next"] is not None


@pytest.mark.django_db
class TestCreateJob:
    def test_creates_job_with_pending_status(self, api_client: APIClient):
        resp = api_client.post("/api/jobs/", {"name": "New Job"}, format="json")

        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "New Job"
        assert data["current_status_type"] == "PENDING"
        assert data["id"] is not None

    def test_rejects_empty_name(self, api_client: APIClient):
        resp = api_client.post("/api/jobs/", {"name": ""}, format="json")
        assert resp.status_code == 400

    def test_rejects_whitespace_only_name(self, api_client: APIClient):
        resp = api_client.post("/api/jobs/", {"name": "   "}, format="json")
        assert resp.status_code == 400

    def test_rejects_missing_name(self, api_client: APIClient):
        resp = api_client.post("/api/jobs/", {}, format="json")
        assert resp.status_code == 400

    def test_rejects_duplicate_name(self, api_client: APIClient):
        api_client.post("/api/jobs/", {"name": "Duplicate API Name"}, format="json")

        resp = api_client.post("/api/jobs/", {"name": "Duplicate API Name"}, format="json")

        assert resp.status_code == 400
        assert "already exists" in " ".join(resp.json()["name"]).lower()

    def test_returns_400_when_service_raises_integrity_error(
        self,
        api_client: APIClient,
        monkeypatch: pytest.MonkeyPatch,
    ):
        def raise_integrity_error(*_args, **_kwargs):
            raise IntegrityError("duplicate key value violates unique constraint")

        monkeypatch.setattr("jobs.views.create_job", raise_integrity_error)

        resp = api_client.post("/api/jobs/", {"name": "Race Condition"}, format="json")

        assert resp.status_code == 400
        assert resp.json() == {"name": ["A job with this name already exists."]}


@pytest.mark.django_db
class TestUpdateJobStatus:
    def test_updates_status(self, api_client: APIClient):
        job = create_job(name="Update Test")
        resp = api_client.patch(
            f"/api/jobs/{job.pk}/",
            {"status_type": "RUNNING"},
            format="json",
        )

        assert resp.status_code == 200
        assert resp.json()["current_status_type"] == "RUNNING"

    def test_rejects_invalid_status(self, api_client: APIClient):
        job = create_job(name="Invalid Status")
        resp = api_client.patch(
            f"/api/jobs/{job.pk}/",
            {"status_type": "EXPLODED"},
            format="json",
        )
        assert resp.status_code == 400

    def test_returns_404_for_nonexistent_job(self, api_client: APIClient):
        resp = api_client.patch(
            "/api/jobs/99999/",
            {"status_type": "RUNNING"},
            format="json",
        )
        assert resp.status_code == 404


@pytest.mark.django_db
class TestDeleteJob:
    def test_deletes_job(self, api_client: APIClient):
        job = create_job(name="Delete Me")
        resp = api_client.delete(f"/api/jobs/{job.pk}/")
        assert resp.status_code == 204

        # Confirm gone
        resp = api_client.get(f"/api/jobs/{job.pk}/")
        assert resp.status_code == 404

    def test_returns_404_for_nonexistent_job(self, api_client: APIClient):
        resp = api_client.delete("/api/jobs/99999/")
        assert resp.status_code == 404


@pytest.mark.django_db
class TestRetrieveJob:
    def test_returns_job_detail(self, api_client: APIClient):
        job = create_job(name="Detail Test")
        resp = api_client.get(f"/api/jobs/{job.pk}/")

        assert resp.status_code == 200
        assert resp.json()["name"] == "Detail Test"
        assert resp.json()["id"] == job.pk

    def test_returns_404_for_nonexistent_job(self, api_client: APIClient):
        resp = api_client.get("/api/jobs/99999/")
        assert resp.status_code == 404


@pytest.mark.django_db
class TestJobStatusHistory:
    def test_returns_status_history(self, api_client: APIClient):
        job = create_job(name="History Test")
        update_job_status(job=job, new_status=JobStatusType.RUNNING)
        update_job_status(job=job, new_status=JobStatusType.COMPLETED)

        resp = api_client.get(f"/api/jobs/{job.pk}/statuses/")

        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 3
        statuses = [s["status_type"] for s in data["results"]]
        # Ordered newest first
        assert statuses == ["COMPLETED", "RUNNING", "PENDING"]

    def test_returns_404_for_nonexistent_job(self, api_client: APIClient):
        resp = api_client.get("/api/jobs/99999/statuses/")
        assert resp.status_code == 404
