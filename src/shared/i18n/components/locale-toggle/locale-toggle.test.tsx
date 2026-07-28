import { render, screen } from "@test/render";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as localeProvider from "../locale-provider/locale-provider";
import { LocaleToggle } from "./locale-toggle";

function mockLocale(locale: "en" | "pt-BR") {
  const setLocale = vi.fn();
  vi.spyOn(localeProvider, "useLocaleMode").mockReturnValue({ locale, setLocale });
  return setLocale;
}

describe("LocaleToggle", () => {
  it("shows the current locale's own name", () => {
    mockLocale("en");
    render(<LocaleToggle />);

    expect(screen.getByRole("button", { name: /switch language to português/i })).toHaveTextContent(
      "English",
    );
  });

  it("switches en -> pt-BR", () => {
    const setLocale = mockLocale("en");
    render(<LocaleToggle />);

    fireEvent.click(screen.getByRole("button", { name: /switch language to português/i }));
    expect(setLocale).toHaveBeenCalledWith("pt-BR");
  });

  it("switches pt-BR -> en", () => {
    const setLocale = mockLocale("pt-BR");
    render(<LocaleToggle />);

    expect(screen.getByRole("button", { name: /switch language to english/i })).toHaveTextContent(
      "Português",
    );
    fireEvent.click(screen.getByRole("button", { name: /switch language to english/i }));
    expect(setLocale).toHaveBeenCalledWith("en");
  });
});
