import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { PanelHeader } from "./panel-header";

describe("PanelHeader", () => {
  it("renders its children", () => {
    render(
      <PanelHeader>
        <span>Anchor pricing</span>
      </PanelHeader>,
    );

    expect(screen.getByText("Anchor pricing")).toBeInTheDocument();
  });

  it("applies the shared bottom-bordered header layout", () => {
    render(
      <PanelHeader>
        <span>content</span>
      </PanelHeader>,
    );

    const header = screen.getByText("content").parentElement as HTMLElement;

    expect(header.className).toContain("border-b");
    expect(header.className).toContain("border-border");
    expect(header.className).toContain("px-4");
    expect(header.className).toContain("py-3");
  });

  it("appends a custom className", () => {
    render(
      <PanelHeader className="justify-between">
        <span>content</span>
      </PanelHeader>,
    );

    const header = screen.getByText("content").parentElement as HTMLElement;

    expect(header.className).toContain("justify-between");
  });

  it("falls back to an empty className when none is given", () => {
    render(
      <PanelHeader>
        <span>content</span>
      </PanelHeader>,
    );

    const header = screen.getByText("content").parentElement as HTMLElement;

    expect(header.className.trim()).toBe(
      "flex items-center gap-2 border-b border-border px-4 py-3",
    );
  });
});
