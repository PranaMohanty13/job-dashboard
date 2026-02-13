import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "../StatusBadge";
import type { JobStatusType } from "../../../../shared/types/job";

describe("StatusBadge", () => {
  const statuses: JobStatusType[] = ["PENDING", "RUNNING", "COMPLETED", "FAILED"];

  it.each(statuses)("renders the %s status text", (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it("applies distinct styling per status", () => {
    const { rerender } = render(<StatusBadge status="PENDING" />);
    const pendingClasses = screen.getByText("PENDING").className;

    rerender(<StatusBadge status="COMPLETED" />);
    const completedClasses = screen.getByText("COMPLETED").className;

    // Different statuses must have different visual styling
    expect(pendingClasses).not.toBe(completedClasses);
  });
});
