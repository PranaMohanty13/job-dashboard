import factory
from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus


class JobFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Job

    name = factory.Sequence(lambda n: f"Test Job {n}")
    current_status_type = JobStatusType.PENDING


class JobStatusFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = JobStatus

    job = factory.SubFactory(JobFactory)
    status_type = JobStatusType.PENDING
