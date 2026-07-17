import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@/test/render";
import { UrlInputForm } from "./url-input-form";

describe("UrlInputForm", () => {
  it("submits a normalized https URL for a bare domain", async () => {
    const onSubmitUrl = vi.fn();
    render(<UrlInputForm onSubmitUrl={onSubmitUrl} isBusy={false} />);

    fireEvent.change(screen.getByPlaceholderText("your-product.com"), {
      target: { value: "flowbase.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    await waitFor(() => expect(onSubmitUrl).toHaveBeenCalledWith("https://flowbase.com"));
  });

  it("shows an inline validation error and does not submit for invalid input", async () => {
    const onSubmitUrl = vi.fn();
    render(<UrlInputForm onSubmitUrl={onSubmitUrl} isBusy={false} />);

    fireEvent.change(screen.getByPlaceholderText("your-product.com"), {
      target: { value: "not a url" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    await waitFor(() => expect(screen.getByText(/Invalid URL/)).toBeInTheDocument());
    expect(onSubmitUrl).not.toHaveBeenCalled();
  });

  it("fills the input when an example URL is clicked", () => {
    const onSubmitUrl = vi.fn();
    render(<UrlInputForm onSubmitUrl={onSubmitUrl} isBusy={false} />);

    fireEvent.click(screen.getByRole("button", { name: "flowbase.com" }));

    expect(screen.getByPlaceholderText("your-product.com")).toHaveValue("flowbase.com");
  });

  it("disables the input, submit, and example buttons while busy", () => {
    const onSubmitUrl = vi.fn();
    render(<UrlInputForm onSubmitUrl={onSubmitUrl} isBusy={true} />);

    expect(screen.getByPlaceholderText("your-product.com")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generating" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "flowbase.com" })).toBeDisabled();
  });
});
