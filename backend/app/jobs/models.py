from django.db import models
from jobs.enums import JobStatusType


class Job(models.Model):

    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Denormalized current status for fast list reads
    current_status_type = models.CharField(
        max_length=20,
        choices=JobStatusType.choices,
        default=JobStatusType.PENDING,
        db_index=True,
    )
    current_status_timestamp = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"], name="idx_job_created_desc"),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.current_status_type})"


class JobStatus(models.Model):

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="statuses",
    )
    status_type = models.CharField(
        max_length=20,
        choices=JobStatusType.choices,
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(
                fields=["job", "-timestamp"],
                name="idx_status_job_ts_desc",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.job.name} → {self.status_type} @ {self.timestamp}"
