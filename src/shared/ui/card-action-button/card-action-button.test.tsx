import { fireEvent, render, screen } from "@test/render";
import { describe, expect, it, vi } from "vitest";
import { CardActionButton } from "./card-action-button";

describe("CardActionButton", () => {
  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<CardActionButton label="Export" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(<CardActionButton label="Export" isDisabled onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the compact card-footer sizing", () => {
    render(<CardActionButton label="Export" />);

    const button = screen.getByRole("button", { name: "Export" });

    expect(button.style.fontWeight).toBe("600");
    expect(button.style.padding).toBe("9px");
  });
});
