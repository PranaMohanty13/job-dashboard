from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

from jobs.enums import JobStatusType
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

    def list(self, request: Request) -> Response:
        queryset = get_jobs_list()
        
        # Apply filters if provided
        status_filter = request.query_params.get("status")
        if status_filter:
            allowed_statuses = {choice[0] for choice in JobStatusType.choices}
            if status_filter not in allowed_statuses:
                return Response(
                    {
                        "detail": "Invalid status filter.",
                        "allowed": sorted(allowed_statuses),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            queryset = queryset.filter(current_status_type=status_filter)
        
        # Apply sorting
        sort_by = request.query_params.get("sort", "-created_at")
        allowed_sorts = ["name", "-name", "created_at", "-created_at"]
        if sort_by not in allowed_sorts:
            return Response(
                {
                    "detail": "Invalid sort parameter.",
                    "allowed": allowed_sorts,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = queryset.order_by(sort_by)
        
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
        
        job = create_job(name=serializer.validated_data["name"])
        
        response_serializer = JobDetailSerializer(job)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request: Request, pk: str = None) -> Response:
        try:
            job_id = self._parse_job_id(pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = get_job_by_id(job_id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        serializer = JobDetailSerializer(job)
        return Response(serializer.data)

    def partial_update(self, request: Request, pk: str = None) -> Response:
        try:
            job_id = self._parse_job_id(pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = get_job_by_id(job_id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        serializer = JobUpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        update_job_status(job=job, new_status=serializer.validated_data["status_type"])
        
        # Refresh and return updated job
        job.refresh_from_db()
        response_serializer = JobDetailSerializer(job)
        return Response(response_serializer.data)

    def destroy(self, request: Request, pk: str = None) -> Response:
        try:
            job_id = self._parse_job_id(pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = get_job_by_id(job_id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        delete_job(job=job)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"], url_path="statuses")
    def statuses(self, request: Request, pk: str = None) -> Response:
        try:
            job_id = self._parse_job_id(pk)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = get_job_by_id(job_id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        queryset = get_job_status_history(job_id=job.id)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = JobStatusSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = JobStatusSerializer(queryset, many=True)
        return Response(serializer.data)
