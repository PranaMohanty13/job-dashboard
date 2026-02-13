import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JobForm } from "../JobForm";
import * as jobsApi from "../../../../api/jobs";

vi.mock("../../../../api/jobs", () => ({
  createJob: vi.fn(),
}));

function renderJobForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <JobForm />
    </QueryClientProvider>,
  );
}

describe("JobForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and submit button", () => {
    renderJobForm();

    expect(screen.getByTestId("new-job-input")).toBeInTheDocument();
    expect(screen.getByTestId("create-job-button")).toHaveTextContent(
      "Create Job",
    );
  });

  it("shows validation error when submitting an empty name", async () => {
    const user = userEvent.setup();
    renderJobForm();

    await user.click(screen.getByTestId("create-job-button"));

    expect(screen.getByText("Job name is required.")).toBeInTheDocument();
    expect(jobsApi.createJob).not.toHaveBeenCalled();
  });

  it("shows validation error when submitting whitespace-only name", async () => {
    const user = userEvent.setup();
    renderJobForm();

    await user.type(screen.getByTestId("new-job-input"), "   ");
    await user.click(screen.getByTestId("create-job-button"));

    expect(screen.getByText("Job name is required.")).toBeInTheDocument();
    expect(jobsApi.createJob).not.toHaveBeenCalled();
  });

  it("calls createJob and clears input on successful submit", async () => {
    const user = userEvent.setup();
    const mockJob = {
      id: 1,
      name: "Test Job",
      current_status_type: "PENDING" as const,
      current_status_timestamp: "2025-01-01T00:00:00Z",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };
    vi.mocked(jobsApi.createJob).mockResolvedValue(mockJob);

    renderJobForm();

    const input = screen.getByTestId("new-job-input");
    await user.type(input, "Test Job");
    await user.click(screen.getByTestId("create-job-button"));

    await waitFor(() => {
      expect(jobsApi.createJob).toHaveBeenCalled();
      expect(vi.mocked(jobsApi.createJob).mock.calls[0][0]).toEqual({
        name: "Test Job",
      });
    });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });

    // Validation error should not be visible
    expect(screen.queryByText("Job name is required.")).not.toBeInTheDocument();
  });

  it("shows error message when createJob API fails", async () => {
    const user = userEvent.setup();
    vi.mocked(jobsApi.createJob).mockRejectedValue(new Error("Server error"));

    renderJobForm();

    await user.type(screen.getByTestId("new-job-input"), "Failing Job");
    await user.click(screen.getByTestId("create-job-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create job. Please try again."),
      ).toBeInTheDocument();
    });
  });
});
