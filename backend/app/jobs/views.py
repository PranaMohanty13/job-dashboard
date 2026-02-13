from django.db import IntegrityError
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response

from jobs.models import Job
from jobs.selectors import get_job_by_id, get_job_status_history, get_jobs_list
from jobs.serializers import (
    JobCreateSerializer,
    JobDetailSerializer,
    JobListSerializer,
    JobStatusSerializer,
    JobUpdateStatusSerializer,
)
from jobs.services import create_job, delete_job, update_job_status


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


class JobsLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100


class JobViewSet(viewsets.ViewSet):

    pagination_class = JobsLimitOffsetPagination

    @staticmethod
    def _parse_job_id(pk: str) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise ValueError("Invalid job id. It must be an integer.")

    def _get_job_or_error_response(self, pk: str) -> tuple[Job | None, Response | None]:
        try:
            job_id = self._parse_job_id(pk)
        except ValueError as exc:
            return None, Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            return get_job_by_id(job_id=job_id), None
        except Job.DoesNotExist:
            return (
                None,
                Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND),
            )

    def list(self, request: Request) -> Response:
        try:
            queryset = get_jobs_list(
                status=request.query_params.get("status"),
                sort=request.query_params.get("sort", "-created_at"),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = JobListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = JobListSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request: Request) -> Response:
        serializer = JobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            job = create_job(name=serializer.validated_data["name"])
        except IntegrityError:
            return Response(
                {"name": ["A job with this name already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        response_serializer = JobDetailSerializer(job)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request: Request, pk: str = None) -> Response:
        job, error_response = self._get_job_or_error_response(pk)
        if error_response:
            return error_response
        
        serializer = JobDetailSerializer(job)
        return Response(serializer.data)

    def partial_update(self, request: Request, pk: str = None) -> Response:
        job, error_response = self._get_job_or_error_response(pk)
        if error_response:
            return error_response
        
        serializer = JobUpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        update_job_status(job=job, new_status=serializer.validated_data["status_type"])
        
        # Refresh and return updated job
        job.refresh_from_db()
        response_serializer = JobDetailSerializer(job)
        return Response(response_serializer.data)

    def destroy(self, request: Request, pk: str = None) -> Response:
        job, error_response = self._get_job_or_error_response(pk)
        if error_response:
            return error_response
        
        delete_job(job=job)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], url_path="statuses")
    def statuses(self, request: Request, pk: str = None) -> Response:
        job, error_response = self._get_job_or_error_response(pk)
        if error_response:
            return error_response
        
        queryset = get_job_status_history(job_id=job.id)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = JobStatusSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = JobStatusSerializer(queryset, many=True)
        return Response(serializer.data)
