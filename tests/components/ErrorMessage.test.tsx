import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ErrorMessage } from "../../src/components/ErrorMessage";
import type { ApiErrorInfo } from "../../src/types/apiError";

afterEach(() => {
  cleanup();
});

describe("ErrorMessage", () => {
  const error: ApiErrorInfo = {
    error: "Bad Request",
    message: "Request validation failed",
    status: 400,
    code: "VALIDATION_ERROR",
    path: "/api/listings",
    timestamp: "2026-10-22T04:39:17.785896Z",
    details: [
      {
        field: "page",
        message: "Page must be a valid integer.",
      },
    ],
  };

  it("should render the error message and title", () => {
    render(<ErrorMessage error={error} onRetry={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Bad Request" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Request validation failed")).toBeInTheDocument();
  });

  it("should render the HTTP status, code, and path", () => {
    render(<ErrorMessage error={error} onRetry={vi.fn()} />);

    expect(screen.getByText(/HTTP status:/)).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();

    expect(screen.getByText(/Code:/)).toBeInTheDocument();
    expect(screen.getByText("VALIDATION_ERROR")).toBeInTheDocument();

    expect(screen.getByText(/Path:/)).toBeInTheDocument();
    expect(screen.getByText("/api/listings")).toBeInTheDocument();
  });

  it("should render validation details", () => {
    render(<ErrorMessage error={error} onRetry={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Details" }),
    ).toBeInTheDocument();

    expect(screen.getByText("page:")).toBeInTheDocument();

    expect(
      screen.getByText("Page must be a valid integer."),
    ).toBeInTheDocument();
  });

  it("should render the timestamp", () => {
    render(<ErrorMessage error={error} onRetry={vi.fn()} />);

    expect(
      screen.getByText(`Timestamp: ${error.timestamp}`),
    ).toBeInTheDocument();
  });

  it("should call onRetry when the retry button is clicked", () => {
    const onRetry = vi.fn();

    render(<ErrorMessage error={error} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should display the default title when error is missing", () => {
    const errorWithoutTitle: ApiErrorInfo = {
      ...error,
      error: "",
    };

    render(<ErrorMessage error={errorWithoutTitle} onRetry={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Request failed" }),
    ).toBeInTheDocument();
  });

  it("should not render optional metadata when it is missing", () => {
    const minimalError: ApiErrorInfo = {
      message: "Unable to connect to the server.",
      details: [],
    };

    render(<ErrorMessage error={minimalError} onRetry={vi.fn()} />);

    expect(
      screen.getByText("Unable to connect to the server."),
    ).toBeInTheDocument();

    expect(screen.queryByText(/HTTP status:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Code:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Path:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Timestamp:/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Details" }),
    ).not.toBeInTheDocument();
  });

  it("should have alert accessibility attributes", () => {
    render(<ErrorMessage error={error} onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });
});
