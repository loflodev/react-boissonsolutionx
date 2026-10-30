import type { AxiosError } from "axios";
import {
  GraphQLServiceError,
  NetworkError,
  ValidationError,
  type ContactFormData,
  type ContactFormResponse,
  type GraphQLError,
  type HomePageDataResponse,
  type Page,
} from "../type";
import axiosInstance, {
  CONTACT_FORM_ID,
  GRAPHQL_ENDPOINT,
  isAxiosError,
} from "../api/axios";

// Map any thrown value to one of the service error types
const toServiceError = (error: unknown): Error => {
  if (
    error instanceof GraphQLServiceError ||
    error instanceof ValidationError ||
    error instanceof NetworkError
  ) {
    return error;
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Server responded with error status
      return new NetworkError(
        `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
        axiosError.response.status
      );
    }
    if (axiosError.request) {
      // Network error
      return new NetworkError("Network error: Unable to reach GraphQL endpoint");
    }
    // Request setup error
    return new NetworkError(`Request error: ${axiosError.message}`);
  }

  // Unknown error
  return new Error(
    `Unexpected error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`
  );
};

// Throw when a GraphQL response carries errors
const assertNoGraphQLErrors = (
  errors: GraphQLError[] | undefined,
  status: number
): void => {
  if (errors && errors.length > 0) {
    const errorMessage = errors.map((error) => error.message).join("; ");
    throw new GraphQLServiceError(
      `GraphQL errors: ${errorMessage}`,
      errors,
      status
    );
  }
};

export const getHomePageData = async (
  query: string
): Promise<{ page: Page }> => {
  try {
    if (!query || typeof query !== "string") {
      throw new Error("GraphQL query is required and must be a string");
    }

    const response = await axiosInstance.post<HomePageDataResponse>(
      GRAPHQL_ENDPOINT,
      {
        query,
      }
    );

    assertNoGraphQLErrors(response.data.errors, response.status);

    // Check if data exists
    if (!response.data.data) {
      throw new GraphQLServiceError(
        "No data returned from GraphQL endpoint",
        [],
        response.status
      );
    }

    return response.data.data;
  } catch (error) {
    throw toServiceError(error);
  }
};

export const submitContactForm = async (
  query: string,
  formData: ContactFormData
): Promise<ContactFormResponse> => {
  try {
    if (!query || typeof query !== "string") {
      throw new Error("GraphQL query is required and must be a string");
    }

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.message) {
      throw new ValidationError("All fields are required");
    }

    const response = await axiosInstance.post<ContactFormResponse>(GRAPHQL_ENDPOINT, {
      query: query,
      variables: {
        input: {
          clientMutationId: "contact-form-submission",
          title: `Contact from ${formData.fullName}`,
          content: `Name: ${formData.fullName}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
          website: formData.website ?? "",
          formId: CONTACT_FORM_ID,
        },
      },
    });

    assertNoGraphQLErrors(response.data.errors, response.status);
    return response.data;
  } catch (error) {
    throw toServiceError(error);
  }
};
