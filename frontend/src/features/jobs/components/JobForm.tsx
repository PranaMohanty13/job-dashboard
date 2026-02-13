import { type FormEvent, useState } from "react";
import { useCreateJob } from "../hooks/useCreateJob";

export function JobForm() {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const createJob = useCreateJob();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Job name is required.");
      return;
    }
    setValidationError(null);
    createJob.mutate({ name: trimmed }, { onSuccess: () => setName("") });
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="create-job-form"
      className="flex flex-wrap items-end gap-3"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="new-job-name"
          className="text-sm font-medium text-slate-300"
        >
          Job name
        </label>
        <input
          id="new-job-name"
          data-testid="new-job-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fluid Dynamics Simulation"
          className="w-64 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        data-testid="create-job-button"
        disabled={createJob.isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createJob.isPending ? "Creating…" : "Create Job"}
      </button>

      {validationError && (
        <p className="w-full text-sm text-amber-400">{validationError}</p>
      )}
      {createJob.isError && (
        <p className="w-full text-sm text-red-400">
          Failed to create job. Please try again.
        </p>
      )}
    </form>
  );
}
