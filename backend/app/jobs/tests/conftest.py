import pytest

from jobs.enums import JobStatusType
from jobs.services import create_job


@pytest.fixture
def sample_job(db):
    return create_job(name="Sample Job")
