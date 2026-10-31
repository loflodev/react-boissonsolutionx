import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { HOME_PAGE_QUERY } from "./graphql/homePageQuery";
import { PRIVACY_PAGE_QUERY } from "./graphql/privacyPageQuery";
import { HOME_PAGE_QUERY_KEY } from "./hooks/useHomePageData";
import { PRIVACY_PAGE_QUERY_KEY } from "./hooks/usePrivacyPageData";
import { getHomePageData, getPrivacyPageData } from "./services/homePageService";
import type { Page, PrivacyPage } from "./type";

export { HOME_DATA_SCRIPT_ID, PRIVACY_DATA_SCRIPT_ID, PRIVACY_PATH } from "./entry-shared";
export { convertToArray } from "./helpers/utils";
export { sanitizeHomeContent, sanitizePrivacyContent } from "./helpers/sanitizeHtml";

// Built with `vite build --ssr`, so the WordPress endpoint comes from the same
// VITE_* env as the browser bundle
export const loadHomeContent = () => getHomePageData(HOME_PAGE_QUERY);
export const loadPrivacyContent = () => getPrivacyPageData(PRIVACY_PAGE_QUERY);

// `privacy` is only needed when rendering the privacy policy page
export const render = (
  content: { page: Page },
  url = "/",
  privacy?: { page: PrivacyPage }
): string => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(HOME_PAGE_QUERY_KEY, content);
  if (privacy) queryClient.setQueryData(PRIVACY_PAGE_QUERY_KEY, privacy);

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
