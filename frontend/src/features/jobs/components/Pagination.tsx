interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (newOffset: number) => void;
}

export function Pagination({
  offset,
  limit,
  total,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null;

  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-sm text-slate-400">
        {start} – {end} of {total}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          data-testid="prev-page"
          disabled={!hasPrev}
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          className="rounded-md border border-slate-600 px-3 py-1 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          data-testid="next-page"
          disabled={!hasNext}
          onClick={() => onPageChange(offset + limit)}
          className="rounded-md border border-slate-600 px-3 py-1 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
