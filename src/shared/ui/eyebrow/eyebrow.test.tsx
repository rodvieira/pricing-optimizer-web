import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  it("renders its children", () => {
    render(<Eyebrow>PSYCHOLOGY-DRIVEN PRICING</Eyebrow>);

    expect(screen.getByText("PSYCHOLOGY-DRIVEN PRICING")).toBeInTheDocument();
  });

  it("defaults to the secondary tone", () => {
    render(<Eyebrow>label</Eyebrow>);

    expect(screen.getByText("label").className).toContain("text-secondary");
  });

  it.each([
    ["accent", "text-accent"],
    ["secondary", "text-secondary"],
    ["muted", "text-(--po-text-muted)"],
    ["rust", "text-(--po-accent-rust)"],
  ] as const)("applies the %s tone class", (tone, expectedClass) => {
    render(<Eyebrow tone={tone}>label</Eyebrow>);

    expect(screen.getByText("label").className).toContain(expectedClass);
  });

  it("applies no tone class for the inherit tone", () => {
    render(<Eyebrow tone="inherit">label</Eyebrow>);

    const el = screen.getByText("label");

    expect(el.className).not.toContain("text-accent");
    expect(el.className).not.toContain("text-secondary");
  });

  it("does not render a rule by default", () => {
    const { container } = render(<Eyebrow>label</Eyebrow>);

    expect(container.querySelector("span[aria-hidden]")).not.toBeInTheDocument();
  });

  it("renders a rule when withRule is set", () => {
    const { container } = render(<Eyebrow withRule>label</Eyebrow>);

    const rule = container.querySelector("span[aria-hidden]");

    expect(rule).toBeInTheDocument();
    expect(rule?.className).toContain("bg-current");
  });

  it("appends a custom className and passes through style", () => {
    render(
      <Eyebrow className="mt-2" style={{ opacity: 0.5 }}>
        label
      </Eyebrow>,
    );

    const el = screen.getByText("label");

    expect(el.className).toContain("mt-2");
    expect(el.style.opacity).toBe("0.5");
  });
});
