import { useQuery } from "@tanstack/react-query";
import { listJobStatuses } from "../../../api/jobs";

interface UseJobHistoryOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useJobHistory(
  jobId: number,
  options: UseJobHistoryOptions = {},
) {
  const { limit, offset, enabled = true } = options;

  return useQuery({
    queryKey: ["jobs", "history", jobId, { limit, offset }],
    queryFn: () => listJobStatuses(jobId, { limit, offset }),
    enabled,
  });
}
