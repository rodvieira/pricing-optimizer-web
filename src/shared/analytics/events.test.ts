import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";
import { CONSENT_STORAGE_KEY } from "./components/consent-provider";
import { trackExportTriggered, trackGenerationCompleted, trackUrlSubmitted } from "./events";

describe("analytics event tracking", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(sendGAEvent).mockClear();
  });

  it("does not send any event when consent was never granted", () => {
    trackUrlSubmitted();
    trackGenerationCompleted();
    trackExportTriggered("jsx");
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("does not send any event when consent was explicitly denied", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "denied");
    trackUrlSubmitted();
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("sends url_submitted once consent is granted", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    trackUrlSubmitted();
    expect(sendGAEvent).toHaveBeenCalledWith("event", "url_submitted");
  });

  it("sends generation_completed once consent is granted", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    trackGenerationCompleted();
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generation_completed");
  });

  it("sends export_triggered with the format once consent is granted", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    trackExportTriggered("stripe");
    expect(sendGAEvent).toHaveBeenCalledWith("event", "export_triggered", { format: "stripe" });
  });
});
