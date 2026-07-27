import { render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { Text } from "./text";

describe("Text", () => {
  it("renders its children", () => {
    render(<Text type="body">Hello</Text>);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it.each([
    ["display-1", "H2"],
    ["display-3", "H2"],
    ["large", "P"],
    ["body", "P"],
    ["label", "SPAN"],
    ["supporting", "SPAN"],
  ] as const)("defaults type %s to a <%s>", (type, expectedTag) => {
    render(<Text type={type}>content</Text>);

    expect(screen.getByText("content").tagName).toBe(expectedTag);
  });

  it("renders as the given element when `as` is provided", () => {
    render(
      <Text type="display-1" as="h1">
        Heading
      </Text>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Heading" })).toBeInTheDocument();
  });

  it("defaults to the primary color", () => {
    render(<Text type="body">content</Text>);

    expect(screen.getByText("content").className).toContain("text-primary");
  });

  it("applies the secondary color when given", () => {
    render(
      <Text type="body" color="secondary">
        content
      </Text>,
    );

    const el = screen.getByText("content");

    expect(el.className).toContain("text-secondary");
    expect(el.className).not.toContain("text-primary");
  });

  it("merges a custom className over the base type classes", () => {
    render(
      <Text type="display-3" className="block text-[32px]">
        content
      </Text>,
    );

    const el = screen.getByText("content");

    expect(el.className).toContain("block");
    expect(el.className).toContain("text-[32px]");
    // cn (tailwind-merge) resolves the conflicting size utility in favor of
    // the caller's override, matching how every real call site relies on
    // className to win over this component's own default type size.
    expect(el.className).not.toContain("text-2xl");
  });
});
