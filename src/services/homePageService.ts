import type { AxiosError } from "axios";
import {
  GraphQLServiceError,
  NetworkError,
  ValidationError,
  type ContactFormData,
  type ContactFormResponse,
  type HomePageDataResponse,
  type Page,
} from "../type";
import axiosInstance, { isAxiosError } from "../api/axios";

export const getHomePageData = async (
  query: string
): Promise<{ page: Page }> => {
  try {
    if (!query || typeof query !== "string") {
      throw new Error("GraphQL query is required and must be a string");
    }

    const response = await axiosInstance.post<HomePageDataResponse>(
      "/graphql",
      {
        query,
      }
    );

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessage = response.data.errors
        .map((error) => error.message)
        .join("; ");

      throw new GraphQLServiceError(
        `GraphQL errors: ${errorMessage}`,
        response.data.errors,
        response.status
      );
    }

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
    // Handle different types of errors
    if (
      error instanceof GraphQLServiceError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // Server responded with error status
        throw new NetworkError(
          `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
          axiosError.response.status
        );
      } else if (axiosError.request) {
        // Network error
        throw new NetworkError(
          "Network error: Unable to reach GraphQL endpoint"
        );
      } else {
        // Request setup error
        throw new NetworkError(`Request error: ${axiosError.message}`);
      }
    }

    // Unknown error
    throw new Error(
      `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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

    const response = await axiosInstance.post("/graphql", {
      query: query,
      variables: {
        input: {
          clientMutationId: "contact-form-submission",
          title: `Contact from ${formData.fullName}`,
          content: `Name: ${formData.fullName}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
          status: "publish",
        },
      },
    });

    if (response.data.errors) {
      throw new NetworkError(
        "No data return form API endpoint",
        response.status
      );
    }
    return response.data;
  } catch (error) {
    // Handle different types of errors
    if (
      error instanceof GraphQLServiceError ||
      error instanceof ValidationError ||
      error instanceof NetworkError
    ) {
      throw error;
    }

    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // Server responded with error status
        throw new NetworkError(
          `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
          axiosError.response.status
        );
      } else if (axiosError.request) {
        // Network error
        throw new NetworkError(
          "Network error: Unable to reach GraphQL endpoint"
        );
      } else {
        // Request setup error
        throw new NetworkError(`Request error: ${axiosError.message}`);
      }
    }

    // Unknown error
    throw new Error(
      `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
