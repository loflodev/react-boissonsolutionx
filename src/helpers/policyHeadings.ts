export interface PolicyHeading {
  id: string;
  title: string;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const toText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .trim();

// "Témoins (cookies) et suivi" → "temoins-cookies-et-suivi"
const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Give every <h2> of the sanitized policy an anchor id and list them for the
// table of contents. Pure string work, so the prerender and the browser
// produce the same markup. Expects sanitized HTML (no attributes on h2)
export const addHeadingIds = (html: string) => {
  const headings: PolicyHeading[] = [];
  const used = new Set<string>();

  const withIds = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const title = toText(inner);
    const base = slugify(title) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    headings.push({ id, title });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: withIds, headings };
};
