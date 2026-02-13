import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("renders page info text", () => {
    render(
      <Pagination offset={0} limit={20} total={50} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText("1 – 20 of 50")).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    render(
      <Pagination offset={0} limit={20} total={50} onPageChange={vi.fn()} />,
    );

    expect(screen.getByTestId("prev-page")).toBeDisabled();
    expect(screen.getByTestId("next-page")).toBeEnabled();
  });

  it("disables Next button on last page", () => {
    render(
      <Pagination offset={40} limit={20} total={50} onPageChange={vi.fn()} />,
    );

    expect(screen.getByTestId("next-page")).toBeDisabled();
    expect(screen.getByTestId("prev-page")).toBeEnabled();
  });

  it("calls onPageChange with correct offset when clicking Next", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        offset={0}
        limit={20}
        total={50}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByTestId("next-page"));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(20);
  });

  it("calls onPageChange with correct offset when clicking Previous", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        offset={20}
        limit={20}
        total={50}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByTestId("prev-page"));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it("renders nothing when total is 0", () => {
    const { container } = render(
      <Pagination offset={0} limit={20} total={0} onPageChange={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });
});
