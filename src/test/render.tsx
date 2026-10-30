import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

// Render inside the same providers as main.tsx, with a fresh query cache
// per test. `seed` pre-fills the cache like the prerendered __HOME_DATA__ does.
// Hooks may set their own `retry`; retryDelay 0 keeps those retries instant.
export const renderWithProviders = (
  ui: ReactElement,
  { seed }: { seed?: [readonly unknown[], unknown] } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
  if (seed) queryClient.setQueryData(seed[0], seed[1]);

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    ),
  };
};
