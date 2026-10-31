import type { Config, DOMPurify } from "dompurify";
import type { Page, PrivacyPage } from "../type";

// WordPress rich text is short copy: keep inline formatting, lists and links,
// drop everything else (forms, media, styles, handlers)
const CONFIG: Config = {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "b", "i", "a", "ul", "ol", "li"],
  ALLOWED_ATTR: ["href"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
};

// The privacy policy is long-form: section headings (h2, h3) on top of that
const POLICY_CONFIG: Config = {
  ...CONFIG,
  ALLOWED_TAGS: [...(CONFIG.ALLOWED_TAGS as string[]), "h2", "h3"],
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

export const sanitizePolicyHtml = (html: string, purifier: DOMPurify): string =>
  purifier.sanitize(html, POLICY_CONFIG);

// Same as sanitizeHomeContent, for the privacy policy page
export const sanitizePrivacyContent = (
  content: { page: PrivacyPage },
  purifier: DOMPurify
): { page: PrivacyPage } => ({
  page: { ...content.page, content: sanitizePolicyHtml(content.page.content, purifier) },
});
