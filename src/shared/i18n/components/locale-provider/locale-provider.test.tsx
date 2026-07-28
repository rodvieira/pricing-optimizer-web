import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";
import { LOCALE_STORAGE_KEY, LocaleProvider, useLocaleMode } from "./locale-provider";

function Probe() {
  const { locale, setLocale } = useLocaleMode();
  const t = useTranslations("header");
  return (
    <div>
      <span>locale: {locale}</span>
      <span>label: {t("settings")}</span>
      <button type="button" onClick={() => setLocale("pt-BR")}>
        go pt-BR
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        go en
      </button>
    </div>
  );
}

describe("LocaleProvider / useLocaleMode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to English with nothing stored", () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText("locale: en")).toBeInTheDocument();
    expect(screen.getByText("label: Settings")).toBeInTheDocument();
  });

  it("adopts a validly stored locale after mount (not as the initial render, to avoid a hydration mismatch)", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    await waitFor(() => expect(screen.getByText("locale: pt-BR")).toBeInTheDocument());
    expect(screen.getByText("label: Configurações")).toBeInTheDocument();
  });

  it("ignores a stored value outside the known locale set", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "fr");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText("locale: en")).toBeInTheDocument();
  });

  it("setLocale updates state, persists to localStorage, and re-renders translated text", async () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "go pt-BR" }));

    await waitFor(() => expect(screen.getByText("locale: pt-BR")).toBeInTheDocument());
    expect(screen.getByText("label: Configurações")).toBeInTheDocument();
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("pt-BR");
  });

  it("switches back to English and updates the stored value", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "pt-BR");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "go en" }));

    await waitFor(() => expect(screen.getByText("locale: en")).toBeInTheDocument());
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("throws when useLocaleMode is called outside the provider", () => {
    expect(() => render(<Probe />)).toThrow("useLocaleMode must be used within a LocaleProvider");
  });
});
