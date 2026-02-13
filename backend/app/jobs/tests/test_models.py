import pytest

from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus


@pytest.mark.django_db
class TestJobModel:
    def test_str_representation(self):
        job = Job.objects.create(name="Simulation Run")
        assert "Simulation Run" in str(job)
        assert "PENDING" in str(job)

    def test_default_ordering_is_newest_first(self):
        j1 = Job.objects.create(name="First")
        j2 = Job.objects.create(name="Second")

        jobs = list(Job.objects.all())
        assert jobs[0].pk == j2.pk
        assert jobs[1].pk == j1.pk

    def test_auto_timestamps(self):
        job = Job.objects.create(name="Timestamp Check")
        assert job.created_at is not None
        assert job.updated_at is not None

    def test_default_status_type_is_pending(self):
        job = Job.objects.create(name="Default Status")
        assert job.current_status_type == JobStatusType.PENDING


@pytest.mark.django_db
class TestJobStatusModel:
    def test_str_representation(self):
        job = Job.objects.create(name="Parent Job")
        status = JobStatus.objects.create(job=job, status_type=JobStatusType.RUNNING)
        assert "Parent Job" in str(status)
        assert "RUNNING" in str(status)

    def test_cascade_delete(self):
        job = Job.objects.create(name="Cascade Test")
        JobStatus.objects.create(job=job, status_type=JobStatusType.PENDING)
        JobStatus.objects.create(job=job, status_type=JobStatusType.RUNNING)

        job_id = job.pk
        job.delete()
        assert JobStatus.objects.filter(job_id=job_id).count() == 0

    def test_ordering_newest_first(self):
        job = Job.objects.create(name="Order Test")
        s1 = JobStatus.objects.create(job=job, status_type=JobStatusType.PENDING)
        s2 = JobStatus.objects.create(job=job, status_type=JobStatusType.RUNNING)

        statuses = list(JobStatus.objects.filter(job=job))
        assert statuses[0].pk == s2.pk
        assert statuses[1].pk == s1.pk


@pytest.mark.django_db
class TestJobStatusTypeEnum:
    def test_has_four_choices(self):
        assert len(JobStatusType.choices) == 4

    def test_expected_values(self):
        values = {choice[0] for choice in JobStatusType.choices}
        assert values == {"PENDING", "RUNNING", "COMPLETED", "FAILED"}
