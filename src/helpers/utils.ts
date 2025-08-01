import type { Page, ProductCard } from "../type";

export const convertToArray = (
  ouProducts: Page["ourProducts"]
): ProductCard[] => Object.values(ouProducts).filter(Boolean);
