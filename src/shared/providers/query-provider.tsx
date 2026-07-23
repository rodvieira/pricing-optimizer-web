"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Created once per component instance (not per render) via useState's lazy
  // initializer, and never shared across requests — the standard App Router
  // pattern for avoiding cross-request state leakage on the server.
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
