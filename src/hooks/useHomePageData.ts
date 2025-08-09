import { useQuery } from "@tanstack/react-query";
import { HOME_PAGE_QUERY } from "../graphql/homePageQuery";
import { getHomePageData } from "../services/homePageService";
import { convertToArray } from "../helpers/utils";
import { ValidationError, type Page, type ProductCard } from "../type";

interface UseHomePageDataReturn {
  status: "pending" | "error" | "success";
  data: { page: Page } | undefined;
  error: Error | null;
  products: ProductCard[];
  heroData: Page["heroSection"] | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

const useHomePageData = (): UseHomePageDataReturn => {
  const { status, data, error, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["homePage"],
    queryFn: () => getHomePageData(HOME_PAGE_QUERY),
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        return false;
      }
      // Retry up to 3 times for network errors
      return failureCount < 3;
    },
  });

  const products = data ? convertToArray(data.page.ourProducts) : [];
  const heroData = data?.page.heroSection;

  return {
    status,
    data,
    error,
    products,
    heroData,
    isLoading,
    isError,
    isSuccess,
  };
};

export default useHomePageData;
