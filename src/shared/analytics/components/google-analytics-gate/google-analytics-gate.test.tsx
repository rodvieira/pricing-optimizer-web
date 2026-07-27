import { render, screen, waitFor } from "@test/render";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => <div data-testid="ga-mount" data-ga-id={gaId} />,
}));

import { CONSENT_STORAGE_KEY, ConsentProvider } from "../consent-provider";
import { GoogleAnalyticsGate } from "./google-analytics-gate";

function renderGate() {
  return render(
    <ConsentProvider>
      <GoogleAnalyticsGate />
    </ConsentProvider>,
  );
}

describe("GoogleAnalyticsGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not mount GA when a measurement ID is configured but consent is undecided", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    renderGate();
    expect(screen.queryByTestId("ga-mount")).not.toBeInTheDocument();
  });

  it("does not mount GA when consent is granted but no measurement ID is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    renderGate();
    await waitFor(() => expect(screen.queryByTestId("ga-mount")).not.toBeInTheDocument());
  });

  it("does not mount GA when consent was explicitly denied", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    renderGate();
    await waitFor(() => expect(screen.queryByTestId("ga-mount")).not.toBeInTheDocument());
  });

  it("mounts GA with the configured measurement ID once consent is granted", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    renderGate();
    await waitFor(() => expect(screen.getByTestId("ga-mount")).toBeInTheDocument());
    expect(screen.getByTestId("ga-mount")).toHaveAttribute("data-ga-id", "G-TEST123");
  });
});
