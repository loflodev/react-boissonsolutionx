import { useQuery } from "@tanstack/react-query";
import { PRIVACY_PAGE_QUERY } from "../graphql/privacyPageQuery";
import { getPrivacyPageData } from "../services/homePageService";
import { ValidationError } from "../type";

export const PRIVACY_PAGE_QUERY_KEY = ["privacyPage"];

const usePrivacyPageData = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: PRIVACY_PAGE_QUERY_KEY,
    queryFn: () => getPrivacyPageData(PRIVACY_PAGE_QUERY),
    // Same policy as the home page: no retry on validation errors, 3 otherwise
    retry: (failureCount, error) =>
      !(error instanceof ValidationError) && failureCount < 3,
  });

  return {
    page: data?.page,
    isLoading,
    // A failed background refresh keeps the prerendered policy on screen
    isError: isError && !data,
  };
};

export default usePrivacyPageData;
