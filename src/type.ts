export interface Menu {
  name: string;
  link: string;
}
export interface ImageNode {
  link: string;
  sourceUrl?: string;
}
export interface Image {
  node: ImageNode;
}
export interface ButtonLink {
  title: string;
  url: string;
}

export interface Button {
  link: ButtonLink | null;
  label: string;
}

export interface Features {
  feature1: string;
  feature2: string;
}

export interface ProductCard {
  cover: Image;
  name: string;
  description: string;
  features: Features;
  button: Button;
}
export interface HeroSection {
  description: string;
  subtitle: string;
  title: string;
  image: Image;
  button: Button;
}

export interface OurProducts {
  card1: ProductCard;
  card2: ProductCard;
  card3: ProductCard;
  card4: ProductCard;
}
export interface Page {
  heroSection: HeroSection;
  ourProducts: OurProducts;
}
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: Record<string, any>;
}
export interface HomePageDataResponse {
  data?: {
    page: Page;
  };
  errors?: GraphQLError[];
  extensions?: {
    debug?: Array<{
      type: string;
      message: string;
    }>;
  };
}

export interface ContactFormData {
  fullName: string;
  email: string;
  message: string;
}

export interface ContactFormResponse {
  data?: {
    createContactMessage: {
      clientMutationId: string;
      contactMessage: {
        id: string;
        title: string;
        content: string;
        status: string;
      };
    };
  };
  errors?: GraphQLError[];
}

export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class GraphQLServiceError extends Error {
  public errors: GraphQLError[];
  public statusCode?: number;

  constructor(message: string, errors: GraphQLError[], statusCode?: number) {
    super(message);
    this.name = "GraphQLServiceError";
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

export class NetworkError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}
