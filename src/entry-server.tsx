import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { HOME_PAGE_QUERY } from "./graphql/homePageQuery";
import { HOME_PAGE_QUERY_KEY } from "./hooks/useHomePageData";
import { getHomePageData } from "./services/homePageService";
import type { Page } from "./type";

export { HOME_DATA_SCRIPT_ID } from "./entry-shared";
export { convertToArray } from "./helpers/utils";
export { sanitizeHomeContent } from "./helpers/sanitizeHtml";

// Built with `vite build --ssr`, so the WordPress endpoint comes from the same
// VITE_* env as the browser bundle
export const loadHomeContent = () => getHomePageData(HOME_PAGE_QUERY);

export const render = (content: { page: Page }, url = "/"): string => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(HOME_PAGE_QUERY_KEY, content);

  return renderToString(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};
