import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { JobList } from "../JobList";
import type { Job } from "../../../../shared/types/job";

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 1,
  name: "Fluid Dynamics Simulation",
  current_status_type: "PENDING",
  current_status_timestamp: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

function renderJobList(
  props: Partial<React.ComponentProps<typeof JobList>> = {},
) {
  const defaultProps = {
    jobs: [] as Job[],
    onStatusChange: vi.fn(),
    onDelete: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <MemoryRouter>
        <JobList {...defaultProps} />
      </MemoryRouter>,
    ),
    onStatusChange: defaultProps.onStatusChange,
    onDelete: defaultProps.onDelete,
  };
}

describe("JobList", () => {
  it("shows empty-state message when there are no jobs", () => {
    renderJobList({ jobs: [] });

    expect(
      screen.getByText("No jobs found. Create one above to get started."),
    ).toBeInTheDocument();
  });

  it("renders a row for each job with name and status", () => {
    const jobs = [
      makeJob({ id: 1, name: "Job A", current_status_type: "PENDING" }),
      makeJob({ id: 2, name: "Job B", current_status_type: "COMPLETED" }),
    ];

    renderJobList({ jobs });

    const row1 = screen.getByTestId("job-row-1");
    const row2 = screen.getByTestId("job-row-2");

    expect(row1).toHaveTextContent("Job A");
    expect(row1).toHaveTextContent("PENDING");
    expect(row2).toHaveTextContent("Job B");
    expect(row2).toHaveTextContent("COMPLETED");
  });

  it("calls onDelete with the correct job id when delete is clicked", async () => {
    const user = userEvent.setup();
    const jobs = [makeJob({ id: 42, name: "To Delete" })];

    const { onDelete } = renderJobList({ jobs });

    await user.click(screen.getByTestId("delete-job-42"));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it("calls onStatusChange when a new status is selected", async () => {
    const user = userEvent.setup();
    const jobs = [
      makeJob({ id: 7, name: "Status Test", current_status_type: "PENDING" }),
    ];

    const { onStatusChange } = renderJobList({ jobs });

    await user.selectOptions(screen.getByTestId("status-select-7"), "RUNNING");

    expect(onStatusChange).toHaveBeenCalledOnce();
    expect(onStatusChange).toHaveBeenCalledWith(7, "RUNNING");
  });

  it("disables delete button for the job being deleted", () => {
    const jobs = [makeJob({ id: 5 })];
    renderJobList({ jobs, isDeletingJobId: 5 });

    expect(screen.getByTestId("delete-job-5")).toBeDisabled();
  });

  it("disables status selector for the job being updated", () => {
    const jobs = [makeJob({ id: 3 })];
    renderJobList({ jobs, isUpdatingJobId: 3 });

    expect(screen.getByTestId("status-select-3")).toBeDisabled();
  });
});
