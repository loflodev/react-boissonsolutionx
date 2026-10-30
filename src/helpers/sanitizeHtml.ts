import type { Config, DOMPurify } from "dompurify";
import type { Page } from "../type";

// WordPress rich text is short copy: keep inline formatting, lists and links,
// drop everything else (forms, media, styles, handlers)
const CONFIG: Config = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "a", "ul", "ol", "li"],
  ALLOWED_ATTR: ["href"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
};

// The purifier is passed in: the browser uses its own window, the build-time
// prerender one from jsdom
export const sanitizeHtml = (html: string, purifier: DOMPurify): string =>
  purifier.sanitize(html, CONFIG);

// The WordPress fields rendered as HTML, sanitized before they are baked
// into the static page or its embedded data
export const sanitizeHomeContent = (
  content: { page: Page },
  purifier: DOMPurify
): { page: Page } => {
  const hero = content.page.heroSection;
  if (!hero?.description) return content;
  return {
    ...content,
    page: {
      ...content.page,
      heroSection: { ...hero, description: sanitizeHtml(hero.description, purifier) },
    },
  };
};
