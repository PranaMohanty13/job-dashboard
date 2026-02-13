import { Routes, Route, Navigate, Link } from "react-router-dom";
import { JobsListPage } from "../features/jobs/pages/JobsListPage";
import { JobDetailsPage } from "../features/jobs/pages/JobDetailsPage";

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-100">404 — Not Found</h1>
      <p className="mt-2 text-sm text-slate-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm text-blue-400 hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<JobsListPage />} />
      <Route path="/jobs" element={<Navigate to="/" replace />} />
      <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
