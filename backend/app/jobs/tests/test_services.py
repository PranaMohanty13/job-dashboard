import pytest
from django.db import IntegrityError
from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus
from jobs.services import create_job, delete_job, update_job_status


@pytest.mark.django_db
class TestCreateJob:
    def test_creates_job_with_pending_status(self):
        job = create_job(name="Fluid Dynamics Simulation")

        assert job.pk is not None
        assert job.name == "Fluid Dynamics Simulation"
        assert job.current_status_type == JobStatusType.PENDING
        assert job.current_status_timestamp is not None

    def test_creates_initial_status_entry(self):
        job = create_job(name="ML Training")

        statuses = JobStatus.objects.filter(job=job)
        assert statuses.count() == 1
        assert statuses.first().status_type == JobStatusType.PENDING

    def test_job_timestamps_are_set(self):
        job = create_job(name="Timestamp Test")

        assert job.created_at is not None
        assert job.updated_at is not None

    def test_rejects_duplicate_name(self):
        create_job(name="Duplicate Name")

        with pytest.raises(IntegrityError):
            create_job(name="Duplicate Name")


@pytest.mark.django_db
class TestUpdateJobStatus:
    def test_appends_new_status_entry(self):
        job = create_job(name="Status Update Test")
        update_job_status(job=job, new_status=JobStatusType.RUNNING)

        statuses = JobStatus.objects.filter(job=job).order_by("-timestamp")
        assert statuses.count() == 2
        assert statuses.first().status_type == JobStatusType.RUNNING

    def test_updates_denormalized_fields(self):
        job = create_job(name="Denorm Test")
        update_job_status(job=job, new_status=JobStatusType.COMPLETED)

        job.refresh_from_db()
        assert job.current_status_type == JobStatusType.COMPLETED
        assert job.current_status_timestamp is not None

    def test_multiple_status_transitions(self):
        job = create_job(name="Multi Transition")
        update_job_status(job=job, new_status=JobStatusType.RUNNING)
        update_job_status(job=job, new_status=JobStatusType.COMPLETED)

        job.refresh_from_db()
        assert job.current_status_type == JobStatusType.COMPLETED
        assert JobStatus.objects.filter(job=job).count() == 3


@pytest.mark.django_db
class TestDeleteJob:
    def test_deletes_job_and_cascades_statuses(self):
        job = create_job(name="To Delete")
        job_id = job.pk
        update_job_status(job=job, new_status=JobStatusType.RUNNING)

        delete_job(job=job)

        assert not Job.objects.filter(pk=job_id).exists()
        assert not JobStatus.objects.filter(job_id=job_id).exists()
