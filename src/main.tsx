import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "@fontsource-variable/playfair-display";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { HOME_PAGE_QUERY_KEY } from "./hooks/useHomePageData";
import { PRIVACY_PAGE_QUERY_KEY } from "./hooks/usePrivacyPageData";
import { HOME_DATA_SCRIPT_ID, PRIVACY_DATA_SCRIPT_ID } from "./entry-shared";

const queryClient = new QueryClient();

// Reuse the WordPress content baked in at build time so the first render
// matches the prerendered HTML; React Query still refreshes it in the background
const EMBEDDED_DATA = [
  [HOME_DATA_SCRIPT_ID, HOME_PAGE_QUERY_KEY],
  [PRIVACY_DATA_SCRIPT_ID, PRIVACY_PAGE_QUERY_KEY],
] as const;

for (const [scriptId, queryKey] of EMBEDDED_DATA) {
  const script = document.getElementById(scriptId);
  if (!script?.textContent) continue;
  // Unreadable data must not stop the app: React Query fetches it instead
  try {
    queryClient.setQueryData(queryKey, JSON.parse(script.textContent));
  } catch (error) {
    console.error(`Embedded ${scriptId} unreadable, fetching instead:`, error);
  }
}

const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

// Opt in to scroll reveals only now that JS is running (see index.css)
document.documentElement.classList.add("js-reveal");

const container = document.getElementById("root")!;

// Only the production build is prerendered; dev serves an empty root
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
