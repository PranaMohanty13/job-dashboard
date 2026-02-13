import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import { useJobHistory } from "../hooks/useJobHistory";
import { useUpdateJobStatus } from "../hooks/useUpdateJobStatus";
import { StatusBadge } from "../components/StatusBadge";
import { StatusSelector } from "../components/StatusSelector";
import { Pagination } from "../components/Pagination";
import type { JobStatusType } from "../../../shared/types/job";

const HISTORY_PAGE_SIZE = 20;

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const id = Number(jobId);

  const [historyOffset, setHistoryOffset] = useState(0);

  const {
    data: job,
    isLoading: jobLoading,
    isError: jobError,
  } = useJobDetail(id);

  const { data: historyData, isLoading: historyLoading } = useJobHistory(id, {
    limit: HISTORY_PAGE_SIZE,
    offset: historyOffset,
  });

  const updateStatus = useUpdateJobStatus();

  function handleStatusChange(_jobId: number, newStatus: JobStatusType) {
    updateStatus.mutate({ jobId: id, statusType: newStatus });
  }

  if (jobLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-slate-500">Loading job…</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-400">Job not found.</p>
        <Link to="/" className="text-sm text-blue-400 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Link to="/" className="text-sm text-blue-400 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-100">{job.name}</h1>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-slate-400">Status</dt>
            <dd className="mt-1 flex items-center gap-2">
              <StatusBadge status={job.current_status_type} />
              <StatusSelector
                jobId={job.id}
                currentStatus={job.current_status_type}
                disabled={updateStatus.isPending}
                onStatusChange={handleStatusChange}
              />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Created</dt>
            <dd className="mt-1 text-slate-200">
              {new Date(job.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Last updated</dt>
            <dd className="mt-1 text-slate-200">
              {new Date(job.updated_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">ID</dt>
            <dd className="mt-1 font-mono text-slate-200">{job.id}</dd>
          </div>
        </dl>
      </div>

      {/* Status history timeline */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Status History</h2>

        {historyLoading && (
          <p className="mt-4 text-sm text-slate-500">Loading history…</p>
        )}

        {historyData && historyData.results.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No history entries.</p>
        )}

        {historyData && historyData.results.length > 0 && (
          <>
            <ol className="mt-4 space-y-3">
              {historyData.results.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 border-l-2 border-slate-600 pl-4"
                >
                  <StatusBadge status={entry.status_type} />
                  <span className="text-sm text-slate-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
            <Pagination
              offset={historyOffset}
              limit={HISTORY_PAGE_SIZE}
              total={historyData.count}
              onPageChange={setHistoryOffset}
            />
          </>
        )}
      </div>
    </div>
  );
}
