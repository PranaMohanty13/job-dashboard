import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useJobsQuery } from "../useJobsQuery";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { listJobs } from "../../../../api/jobs";
import { ReactNode } from "react";


vi.mock("../../../../api/jobs", () => ({
  listJobs: vi.fn(),
}));


const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useJobsQuery", () => {
  it("fetches and returns jobs successfully", async () => {
    const mockJobs = {
        results: [
            { id: 1, name: "Job 1", current_status_type: "PENDING", current_status_timestamp: "2023-01-01T00:00:00Z", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
            { id: 2, name: "Job 2", current_status_type: "COMPLETED", current_status_timestamp: "2023-01-02T00:00:00Z", created_at: "2023-01-02T00:00:00Z", updated_at: "2023-01-02T00:00:00Z" },
        ],
        count: 2,
        next: null,
        previous: null
    };

    (listJobs as any).mockResolvedValue(mockJobs);

    const { result } = renderHook(() => useJobsQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockJobs);
    expect(listJobs).toHaveBeenCalledWith({});
  });

  it("passes query params to the API", async () => {
      const mockJobs = { results: [], count: 0 };
      (listJobs as any).mockResolvedValue(mockJobs);

      const params = { status: "PENDING" as const };
      const { result } = renderHook(() => useJobsQuery(params), {
          wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(listJobs).toHaveBeenCalledWith(params);
  });
});
