import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";

interface GraphqlMock {
  // Bodies of the contact form mutations the page sent
  submissions: Array<{ query: string; variables: { input: Record<string, string> } }>;
  // Make the next contact form mutation fail with this HTTP status
  failNextSubmit: (status: number) => void;
}

// The WordPress content the build baked into the page (<script id="__HOME_DATA__">)
const loadHomeData = async (request: APIRequestContext): Promise<unknown> => {
  const html = await (await request.get("/")).text();
  const json = html.match(/<script id="__HOME_DATA__" type="application\/json">(.*?)<\/script>/s)?.[1];
  if (!json) throw new Error("No __HOME_DATA__ in the built page: run `npm run build` first");
  return JSON.parse(json);
};

// Answer WPGraphQL locally so the tests never write to the real WordPress:
// content queries get the data baked into the page, mutations are recorded.
// The handler never touches the page, so a request still in flight when a
// test ends cannot fail it.
const mockGraphql = async (page: Page, homeData: unknown): Promise<GraphqlMock> => {
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
    return route.fulfill({ json: { data: homeData } });
  });

  return {
    submissions,
    failNextSubmit: (status) => {
      failStatus = status;
    },
  };
};

// Auto fixture: every test is mocked, whether or not it reads `graphql`
export const test = base.extend<{ graphql: GraphqlMock }>({
  graphql: [
    async ({ page, request }, use) => {
      await use(await mockGraphql(page, await loadHomeData(request)));
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
