import pytest

from jobs.enums import JobStatusType
from jobs.services import create_job


@pytest.fixture
def sample_job(db):
    """Create a job via the service layer (includes initial PENDING status)."""
    return create_job(name="Sample Job")
