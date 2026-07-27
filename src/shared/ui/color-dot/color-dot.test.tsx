import { render } from "@test/render";
import { describe, expect, it } from "vitest";
import { CheckGlyph, ColorDot } from "./color-dot";

describe("ColorDot", () => {
  it("reads the color token for the given swatch color", () => {
    const { container } = render(<ColorDot color="teal" />);

    const dot = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(dot.style.background).toBe("var(--color-icon-teal)");
  });

  it("defaults to a 2x2 rounded swatch when no className is given", () => {
    const { container } = render(<ColorDot color="orange" />);

    const dot = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(dot.className).toContain("h-2");
    expect(dot.className).toContain("w-2");
    expect(dot.className).toContain("rounded-full");
  });

  it("overrides the size classes when a custom className is given", () => {
    const { container } = render(<ColorDot color="pink" className="h-4 w-4" />);

    const dot = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(dot.className).toContain("h-4");
    expect(dot.className).toContain("w-4");
    expect(dot.className).not.toContain("h-2");
  });
});

describe("CheckGlyph", () => {
  it("renders the check mark glyph", () => {
    const { container } = render(<CheckGlyph />);

    expect(container.textContent).toBe("✓");
  });

  it("applies a color token when a color is given", () => {
    const { container } = render(<CheckGlyph color="teal" />);

    const glyph = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(glyph.style.color).toBe("var(--color-icon-teal)");
  });

  it("applies no inline color when none is given", () => {
    const { container } = render(<CheckGlyph />);

    const glyph = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(glyph.style.color).toBe("");
  });

  it("passes through a className", () => {
    const { container } = render(<CheckGlyph className="text-lg" />);

    const glyph = container.querySelector("span[aria-hidden]") as HTMLElement;

    expect(glyph.className).toBe("text-lg");
  });
});
