from typing import Optional

from django.db.models import QuerySet

from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus

ALLOWED_SORTS = ["name", "-name", "created_at", "-created_at"]


def get_jobs_list(
    *,
    status: Optional[str] = None,
    sort: str = "-created_at",
) -> QuerySet[Job]:
    qs = Job.objects.all()

    if status is not None:
        allowed_statuses = {choice[0] for choice in JobStatusType.choices}
        if status not in allowed_statuses:
            raise ValueError(
                f"Invalid status filter. Allowed: {sorted(allowed_statuses)}"
            )
        qs = qs.filter(current_status_type=status)

    if sort not in ALLOWED_SORTS:
        raise ValueError(f"Invalid sort parameter. Allowed: {ALLOWED_SORTS}")
    qs = qs.order_by(sort)

    return qs


def get_job_by_id(*, job_id: int) -> Job:
    return Job.objects.get(pk=job_id)


def get_job_status_history(*, job_id: int) -> QuerySet[JobStatus]:
    return JobStatus.objects.filter(job_id=job_id)
