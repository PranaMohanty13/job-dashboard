from django.db import transaction

from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus


@transaction.atomic
def create_job(*, name: str) -> Job:
    job = Job.objects.create(
        name=name,
        current_status_type=JobStatusType.PENDING,
        current_status_timestamp=None,
    )
    status = JobStatus.objects.create(
        job=job,
        status_type=JobStatusType.PENDING,
    )
    job.current_status_timestamp = status.timestamp
    job.save(update_fields=["current_status_timestamp", "updated_at"])
    return job


@transaction.atomic
def update_job_status(*, job: Job, new_status: str) -> JobStatus:
    status = JobStatus.objects.create(
        job=job,
        status_type=new_status,
    )
    job.current_status_type = new_status
    job.current_status_timestamp = status.timestamp
    job.save(update_fields=["current_status_type", "current_status_timestamp", "updated_at"])
    return status


def delete_job(*, job: Job) -> None:
    job.delete()
