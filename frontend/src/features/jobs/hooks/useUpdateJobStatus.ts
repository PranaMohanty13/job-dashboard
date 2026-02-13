import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJobStatus } from "../../../api/jobs";
import type { JobStatusType } from "../../../shared/types/job";

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      statusType,
    }: {
      jobId: number;
      statusType: JobStatusType;
    }) => updateJobStatus(jobId, { status_type: statusType }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["jobs", "detail", variables.jobId],
      });
      queryClient.invalidateQueries({
        queryKey: ["jobs", "history", variables.jobId],
      });
    },
  });
}
