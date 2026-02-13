import type { JobStatusType } from "../../../shared/types/job";

const STATUS_STYLES: Record<JobStatusType, string> = {
  PENDING: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
  RUNNING: "bg-blue-900/30 text-blue-300 border-blue-700",
  COMPLETED: "bg-green-900/30 text-green-300 border-green-700",
  FAILED: "bg-red-900/30 text-red-300 border-red-700",
};

interface StatusBadgeProps {
  status: JobStatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
