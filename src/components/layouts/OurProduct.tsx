import Button from "../common/Button";
import Reveal from "../common/Reveal";
import Section from "../common/Section";
import type { ProductCard } from "../../type";

interface ProductCardProps {
  products: ProductCard[];
}

// WordPress names read "SolutionX - Betterave": show the flavor as the title
// and the range as its label. Names without a dash are shown whole
const splitName = (name: string) => {
  const [range, ...rest] = name.split(" - ");
  return rest.length ? { range, flavor: rest.join(" - ") } : { range: null, flavor: name };
};

// Rendered card width: 4 columns inside the 72rem container on desktop,
// 2 columns from sm, full width (minus the page gutter) on phones
const CARD_IMAGE_SIZES =
  "(min-width: 1152px) 260px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, calc(100vw - 3rem)";

const OurProduct = ({ products }: ProductCardProps) => {
  return (
    <Section eyebrow="01 — Nos produits" sectionTitle="Nos Produits" id="ourProducts">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map((item, index) => {
          const { range, flavor } = splitName(item.name);
          return (
            <Reveal as="li" index={index} key={`${item.name}-${index}`} className="flex">
              <article className="group/card flex w-full flex-col rounded-3xl border border-line bg-white/[0.03] p-2 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                <div className="overflow-hidden rounded-2xl bg-ink">
                  <img
                    className="aspect-square w-full object-cover transition-[scale] duration-500 ease-out motion-safe:group-hover/card:scale-[1.03]"
                    src={item.cover.node.sourceUrl}
                    srcSet={item.cover.node.srcSet ?? undefined}
                    sizes={CARD_IMAGE_SIZES}
                    alt={item.name}
                    width={item.cover.node.mediaDetails?.width}
                    height={item.cover.node.mediaDetails?.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex grow flex-col px-4 pt-6 pb-4">
                  {range && <p className="eyebrow text-[0.6875rem] mb-2">{range}</p>}
                  <h3 className="display text-cream text-[1.75rem]">{flavor}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                  <ul className="mt-5 mb-6 flex flex-wrap gap-2 text-xs tracking-wide text-cream/80">
                    <li className="rounded-full border border-line px-3 py-1">
                      {item.features.feature1}
                    </li>
                    <li className="rounded-full border border-line px-3 py-1">
                      {item.features.feature2}
                    </li>
                  </ul>
                  {/* Every card CTA leads to the contact form */}
                  <Button
                    label={item.button.label}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    withArrow
                    className="mt-auto"
                    asLink
                    to="#contactForm"
                  />
                </div>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
};

export default OurProduct;
