import { useQuery } from "@tanstack/react-query";
import { listJobs } from "../../../api/jobs";
import type { JobsListQueryParams } from "../../../api/contracts";

export function useJobsQuery(params: JobsListQueryParams = {}) {
  return useQuery({
    queryKey: ["jobs", "list", params],
    queryFn: () => listJobs(params),
  });
}
