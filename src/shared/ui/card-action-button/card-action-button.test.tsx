import { fireEvent, render, screen } from "@test/render";
import { describe, expect, it, vi } from "vitest";
import { CardActionButton } from "./card-action-button";

describe("CardActionButton", () => {
  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<CardActionButton label="Export" variant="primary" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(<CardActionButton label="Export" variant="primary" isDisabled onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the outline styling for the secondary variant", () => {
    render(<CardActionButton label="Edit inline" variant="secondary" />);

    const button = screen.getByRole("button", { name: "Edit inline" });

    expect(button.style.backgroundColor).toBe("transparent");
    expect(button.style.fontWeight).toBe("500");
  });

  it("applies the solid weight for the primary variant, with no outline override", () => {
    render(<CardActionButton label="Export" variant="primary" />);

    const button = screen.getByRole("button", { name: "Export" });

    expect(button.style.fontWeight).toBe("600");
    expect(button.style.backgroundColor).toBe("");
  });
});
