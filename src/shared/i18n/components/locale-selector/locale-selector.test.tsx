import { fireEvent, render, screen } from "@test/render";
import { describe, expect, it } from "vitest";
import { LocaleSelector } from "./locale-selector";

describe("LocaleSelector", () => {
  it("shows the current locale as selected, labeled for assistive tech", () => {
    render(<LocaleSelector />);
    const trigger = screen.getByRole("combobox", { name: "Language" });
    expect(trigger).toHaveTextContent("English");
  });

  it("switches locale when the other option is selected", async () => {
    render(<LocaleSelector />);

    fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
    fireEvent.click(await screen.findByRole("option", { name: "Português" }));

    expect(await screen.findByRole("combobox", { name: "Idioma" })).toHaveTextContent("Português");
  });
});
