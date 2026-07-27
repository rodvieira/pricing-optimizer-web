import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { ColorAccentColumn } from "./color-accent-column";

describe("ColorAccentColumn", () => {
  it("renders its children", () => {
    render(
      <ColorAccentColumn color="teal">
        <p>Anchor pricing</p>
      </ColorAccentColumn>,
    );

    expect(screen.getByText("Anchor pricing")).toBeInTheDocument();
  });

  it("sets the top border color from the given strategy color", () => {
    render(
      <ColorAccentColumn color="pink">
        <span>content</span>
      </ColorAccentColumn>,
    );

    const column = screen.getByText("content").parentElement as HTMLElement;

    expect(column.style.borderTopColor).toBe("var(--color-icon-pink)");
  });

  it("appends a custom className to the base layout classes", () => {
    render(
      <ColorAccentColumn color="orange" className="px-4">
        <span>content</span>
      </ColorAccentColumn>,
    );

    const column = screen.getByText("content").parentElement as HTMLElement;

    expect(column.className).toContain("px-4");
    expect(column.className).toContain("border-l");
    expect(column.className).toContain("border-t-2");
  });

  it("falls back to an empty className when none is given", () => {
    render(
      <ColorAccentColumn color="orange">
        <span>content</span>
      </ColorAccentColumn>,
    );

    const column = screen.getByText("content").parentElement as HTMLElement;

    expect(column.className.trim()).toBe("border-l border-t-2 border-border first:border-l-0");
  });
});
