import { useQuery } from "@tanstack/react-query";
import { getJob } from "../../../api/jobs";

export function useJobDetail(jobId: number) {
  return useQuery({
    queryKey: ["jobs", "detail", jobId],
    queryFn: () => getJob(jobId),
    enabled: jobId > 0,
  });
}
