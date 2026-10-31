import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance, { CONTACT_FORM_ID, GRAPHQL_ENDPOINT } from "../api/axios";
import {
  GraphQLServiceError,
  NetworkError,
  ValidationError,
} from "../type";
import { getHomePageData, getPrivacyPageData, submitContactForm } from "./homePageService";

vi.mock("../api/axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/axios")>();
  return { ...actual, default: { post: vi.fn() } };
});

const post = vi.mocked(axiosInstance.post);

const formData = {
  fullName: "Jean Tremblay",
  email: "jean@example.com",
  message: "Bonjour, je veux commander.",
};

const axiosError = (withResponse: boolean, withRequest = true) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    "boom",
    "ERR",
    config,
    withRequest ? {} : undefined,
    withResponse
      ? { status: 500, statusText: "Server Error", data: {}, headers: {}, config }
      : undefined
  );
};

beforeEach(() => {
  post.mockReset();
});

describe("getPrivacyPageData", () => {
  it("returns the page data", async () => {
    post.mockResolvedValue({ status: 200, data: { data: { page: { title: "P" } } } });
    await expect(getPrivacyPageData("query")).resolves.toEqual({ page: { title: "P" } });
  });

  it("fails when the page does not exist, instead of rendering an empty policy", async () => {
    post.mockResolvedValue({ status: 200, data: { data: { page: null } } });
    await expect(getPrivacyPageData("query")).rejects.toBeInstanceOf(GraphQLServiceError);
  });
});

describe("getHomePageData", () => {
  it("returns the page data", async () => {
    post.mockResolvedValue({ status: 200, data: { data: { page: { id: 1 } } } });
    await expect(getHomePageData("query")).resolves.toEqual({ page: { id: 1 } });
  });

  it("rejects an empty query without calling the API", async () => {
    await expect(getHomePageData("")).rejects.toThrow("Unexpected error");
    expect(post).not.toHaveBeenCalled();
  });

  it("throws GraphQLServiceError with joined messages", async () => {
    post.mockResolvedValue({
      status: 200,
      data: { errors: [{ message: "a" }, { message: "b" }] },
    });
    const error = await getHomePageData("query").catch((e) => e);
    expect(error).toBeInstanceOf(GraphQLServiceError);
    expect(error.message).toBe("GraphQL errors: a; b");
  });

  it("throws GraphQLServiceError when no data is returned", async () => {
    post.mockResolvedValue({ status: 200, data: {} });
    await expect(getHomePageData("query")).rejects.toBeInstanceOf(
      GraphQLServiceError
    );
  });

  it("maps an HTTP error to NetworkError with the status", async () => {
    post.mockRejectedValue(axiosError(true));
    const error = await getHomePageData("query").catch((e) => e);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.statusCode).toBe(500);
  });

  it("maps an unreachable server to NetworkError", async () => {
    post.mockRejectedValue(axiosError(false));
    await expect(getHomePageData("query")).rejects.toThrow(
      "Network error: Unable to reach GraphQL endpoint"
    );
  });

  it("maps a request setup error to NetworkError", async () => {
    post.mockRejectedValue(axiosError(false, false));
    await expect(getHomePageData("query")).rejects.toThrow(
      "Request error: boom"
    );
  });
});

describe("submitContactForm", () => {
  it("sends the message without a status and returns the response", async () => {
    const data = { data: { createContactMessage: { clientMutationId: "x" } } };
    post.mockResolvedValue({ status: 200, data });

    await expect(submitContactForm("mutation", formData)).resolves.toEqual(data);

    const input = post.mock.calls[0][1] as {
      variables: { input: Record<string, string> };
    };
    expect(input.variables.input).not.toHaveProperty("status");
    expect(input.variables.input.website).toBe("");
  });

  it("posts to the configured endpoint with the Contact Form 7 id", async () => {
    post.mockResolvedValue({ status: 200, data: {} });

    await submitContactForm("mutation", formData);

    const [endpoint, body] = post.mock.calls[0] as [
      string,
      { variables: { input: Record<string, string> } },
    ];
    expect(endpoint).toBe(GRAPHQL_ENDPOINT);
    expect(body.variables.input.formId).toBe(CONTACT_FORM_ID);
  });

  it("throws ValidationError when a field is missing", async () => {
    await expect(
      submitContactForm("mutation", { ...formData, email: "" })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(post).not.toHaveBeenCalled();
  });

  it("throws GraphQLServiceError on GraphQL errors", async () => {
    post.mockResolvedValue({
      status: 200,
      data: { errors: [{ message: "Too many messages" }] },
    });
    await expect(submitContactForm("mutation", formData)).rejects.toThrow(
      "GraphQL errors: Too many messages"
    );
  });
});
