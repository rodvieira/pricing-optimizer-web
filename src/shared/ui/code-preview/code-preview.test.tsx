import { render, screen } from "@test/render";
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodePreview } from "./code-preview";

describe("CodePreview", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the title", () => {
    render(<CodePreview code="const x = 1;" language="tsx" title="JSX export" />);

    expect(screen.getByText("JSX export")).toBeInTheDocument();
  });

  it("renders the code content, tokenized", () => {
    const { container } = render(
      <CodePreview code="export const x = 1;" language="tsx" title="JSX export" />,
    );

    expect(container.textContent).toContain("export");
    expect(container.textContent).toContain("const");
  });

  it("renders one line number per line of code", () => {
    render(<CodePreview code={"line one\nline two\nline three"} language="tsx" title="t" />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("copies the exact code to the clipboard and shows transient feedback", async () => {
    render(<CodePreview code="export const x = 1;" language="tsx" title="t" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("export const x = 1;"),
    );
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("applies the given maxHeight to the scrollable code container", () => {
    const { container } = render(
      <CodePreview code="const x = 1;" language="tsx" title="t" maxHeight={200} />,
    );

    const pre = container.querySelector("pre") as HTMLElement;

    expect(pre.style.maxHeight).toBe("200px");
  });

  it("defaults maxHeight to 420 when not given", () => {
    const { container } = render(<CodePreview code="const x = 1;" language="tsx" title="t" />);

    const pre = container.querySelector("pre") as HTMLElement;

    expect(pre.style.maxHeight).toBe("420px");
  });
});
