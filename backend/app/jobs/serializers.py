from rest_framework import serializers

from jobs.enums import JobStatusType
from jobs.models import Job, JobStatus


class JobStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobStatus
        fields = ["id", "status_type", "timestamp"]
        read_only_fields = fields


class JobListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = [
            "id",
            "name",
            "current_status_type",
            "current_status_timestamp",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class JobDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Job
        fields = [
            "id",
            "name",
            "current_status_type",
            "current_status_timestamp",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class JobCreateSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=255, min_length=1)

    def validate_name(self, value: str) -> str:
        """Strip whitespace and ensure non-empty."""
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Job name cannot be empty or whitespace only.")
        return cleaned


class JobUpdateStatusSerializer(serializers.Serializer):
    status_type = serializers.ChoiceField(choices=JobStatusType.choices)
