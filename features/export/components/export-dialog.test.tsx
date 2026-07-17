import { fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/export", () => ({
  exportVariation: vi.fn(),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { exportVariation } from "@/lib/api/export";
import { render, screen } from "@/test/render";
import { ExportDialog, type ExportDialogProps } from "./export-dialog";

function renderDialog(props: Partial<ExportDialogProps> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrap = (ui: ReactElement) => (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
  return render(
    wrap(
      <ExportDialog
        isOpen={true}
        onOpenChange={vi.fn()}
        generationId="gen-1"
        variationId="var-1"
        strategyLabel="Anchor pricing"
        {...props}
      />,
    ),
  );
}

describe("ExportDialog", () => {
  beforeEach(() => {
    vi.mocked(exportVariation).mockReset();
  });

  it("shows a loading skeleton while the export is pending", () => {
    vi.mocked(exportVariation).mockReturnValue(new Promise(() => {}));
    renderDialog();

    expect(screen.getByText("Export — Anchor pricing")).toBeInTheDocument();
  });

  it("renders the code block once the export resolves", async () => {
    vi.mocked(exportVariation).mockResolvedValue({
      format: "jsx",
      filename: "f.tsx",
      contentType: "text/plain",
      content: "// jsx content",
    } as never);

    renderDialog();

    await waitFor(() => expect(screen.getByText("// jsx content")).toBeInTheDocument());
  });

  it("shows an error message when the export fails", async () => {
    vi.mocked(exportVariation).mockRejectedValue(new Error("boom"));

    renderDialog();

    await waitFor(() =>
      expect(screen.getByText(/Couldn't generate this export format/)).toBeInTheDocument(),
    );
  });

  it("switches format and refetches when a different tab is selected", async () => {
    vi.mocked(exportVariation).mockImplementation(
      (_gen, _variation, format) =>
        Promise.resolve({
          format,
          filename: `f.${format}`,
          contentType: "text/plain",
          content: `// ${format} content`,
        }) as never,
    );

    renderDialog();
    await waitFor(() => expect(screen.getByText("// jsx content")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Stripe JSON" }));
    await waitFor(() => expect(screen.getByText("// stripe content")).toBeInTheDocument());
  });

  it("does not query without both a generation and a variation id", () => {
    renderDialog({ variationId: null });
    expect(exportVariation).not.toHaveBeenCalled();
  });
});
