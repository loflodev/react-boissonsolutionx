import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";

interface GraphqlMock {
  // Bodies of the contact form mutations the page sent
  submissions: Array<{ query: string; variables: { input: Record<string, string> } }>;
  // Make the next contact form mutation fail with this HTTP status
  failNextSubmit: (status: number) => void;
}

// The WordPress content the build baked into a page (<script id="__HOME_DATA__">
// on the home page, <script id="__PRIVACY_DATA__"> on the privacy policy)
const loadBakedData = async (
  request: APIRequestContext,
  path: string,
  scriptId: string
): Promise<unknown> => {
  const html = await (await request.get(path)).text();
  const pattern = new RegExp(`<script id="${scriptId}" type="application/json">(.*?)</script>`, "s");
  const json = html.match(pattern)?.[1];
  if (!json) throw new Error(`No ${scriptId} in ${path}: run \`npm run build\` first`);
  return JSON.parse(json);
};

const loadContent = async (request: APIRequestContext) => {
  const [home, privacy] = await Promise.all([
    loadBakedData(request, "/", "__HOME_DATA__"),
    loadBakedData(request, "/politique-de-confidentialite", "__PRIVACY_DATA__"),
  ]);
  return { home, privacy };
};

// Answer WPGraphQL locally so the tests never write to the real WordPress:
// content queries get the data baked into the page, mutations are recorded.
// The handler never touches the page, so a request still in flight when a
// test ends cannot fail it.
const mockGraphql = async (
  page: Page,
  content: Awaited<ReturnType<typeof loadContent>>
): Promise<GraphqlMock> => {
  const submissions: GraphqlMock["submissions"] = [];
  let failStatus: number | null = null;

  await page.route("**/graphql**", async (route) => {
    const body = route.request().postDataJSON();
    if (String(body?.query).includes("CreateContactMessage")) {
      submissions.push(body);
      if (failStatus) {
        const status = failStatus;
        failStatus = null;
        return route.fulfill({ status, body: "{}" });
      }
      return route.fulfill({
        json: { data: { createContactMessage: { clientMutationId: "e2e" } } },
      });
    }
    const isPrivacy = String(body?.query).includes("politiqueDeConfidentialite");
    return route.fulfill({ json: { data: isPrivacy ? content.privacy : content.home } });
  });

  return {
    submissions,
    failNextSubmit: (status) => {
      failStatus = status;
    },
  };
};

// A 1×1 transparent PNG; browsers sniff the format, whatever the URL's extension
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

// Serve WordPress media locally too: CI runners can't always reach the live
// host (ERR_HTTP2_PROTOCOL_ERROR), which made the console check flaky
const mockMedia = (page: Page) =>
  page.route("**/wp-content/uploads/**", (route) =>
    route.fulfill({ contentType: "image/png", body: PIXEL })
  );

// Auto fixture: every test is mocked, whether or not it reads `graphql`
export const test = base.extend<{ graphql: GraphqlMock }>({
  graphql: [
    async ({ page, request }, use) => {
      await mockMedia(page);
      await use(await mockGraphql(page, await loadContent(request)));
      await page.unrouteAll({ behavior: "ignoreErrors" });
    },
    { auto: true },
  ],
});

export { expect };

// Show every scroll-revealed block, as if the visitor had scrolled the page
export const revealAll = async (page: Page) => {
  await page.evaluate(() =>
    document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-visible", "true"))
  );
};
