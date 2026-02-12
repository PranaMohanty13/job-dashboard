from django.db.models import QuerySet
from jobs.models import Job, JobStatus


def get_jobs_list() -> QuerySet[Job]:
    return Job.objects.all()


def get_job_by_id(*, job_id: int) -> Job:
    return Job.objects.get(pk=job_id)


def get_job_status_history(*, job_id: int) -> QuerySet[JobStatus]:
    return JobStatus.objects.filter(job_id=job_id)
