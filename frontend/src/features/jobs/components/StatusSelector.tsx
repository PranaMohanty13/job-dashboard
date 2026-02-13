import { JOB_STATUS_OPTIONS } from "../../../shared/types/job";
import type { JobStatusType } from "../../../shared/types/job";

const VALID_STATUSES = new Set<string>(JOB_STATUS_OPTIONS);

function isJobStatusType(value: string): value is JobStatusType {
  return VALID_STATUSES.has(value);
}

interface StatusSelectorProps {
  jobId: number;
  currentStatus: JobStatusType;
  disabled?: boolean;
  onStatusChange: (jobId: number, newStatus: JobStatusType) => void;
}

export function StatusSelector({
  jobId,
  currentStatus,
  disabled = false,
  onStatusChange,
}: StatusSelectorProps) {
  return (
    <select
      data-testid={`status-select-${jobId}`}
      value={currentStatus}
      onChange={(e) => {
        const value = e.target.value;
        if (isJobStatusType(value) && value !== currentStatus) {
          onStatusChange(jobId, value);
        }
      }}
      disabled={disabled}
      className="rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
    >
      {JOB_STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
