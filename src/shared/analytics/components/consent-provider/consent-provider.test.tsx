import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_STORAGE_KEY, ConsentProvider, useConsent } from "./consent-provider";

function Probe() {
  const { status, setStatus } = useConsent();
  return (
    <div>
      <span>status: {status}</span>
      <button type="button" onClick={() => setStatus("granted")}>
        accept
      </button>
      <button type="button" onClick={() => setStatus("denied")}>
        decline
      </button>
    </div>
  );
}

describe("ConsentProvider / useConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts unknown with nothing stored", () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByText("status: unknown")).toBeInTheDocument();
  });

  it("adopts a validly stored status after mount (not as the initial render, to avoid a hydration mismatch)", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    await waitFor(() => expect(screen.getByText("status: granted")).toBeInTheDocument());
  });

  it("ignores a stored value outside the known status set", async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "maybe-later");
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByText("status: unknown")).toBeInTheDocument();
  });

  it("setStatus(granted) updates state and persists to localStorage", async () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "accept" }));

    await waitFor(() => expect(screen.getByText("status: granted")).toBeInTheDocument());
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("granted");
  });

  it("setStatus(denied) updates state and persists to localStorage", async () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "decline" }));

    await waitFor(() => expect(screen.getByText("status: denied")).toBeInTheDocument());
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe("denied");
  });

  it("throws when useConsent is called outside the provider", () => {
    expect(() => render(<Probe />)).toThrow("useConsent must be used within a ConsentProvider");
  });
});
