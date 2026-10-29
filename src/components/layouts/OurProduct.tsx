import Button from "../common/Button";
import Section from "../common/Section";
import type { ProductCard } from "../../type";

interface ProductCardProps {
  products: ProductCard[];
}

const OurProduct = ({ products }: ProductCardProps) => {
  return (
    <Section
      backgroundColor="lightgray"
      sectionTitle="Nos Produits"
      fullVh={false}
      id="ourProducts"
    >
      <ul className="w-full grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] grid-rows-auto gap-8">
        {products.map((item, index) => (
          <li
            className="item rounded-4xl shadow-2xl"
            key={`${item.name}-${index}`}
          >
            <article>
              <img
                className="w-full rounded-tr-4xl rounded-tl-4xl object-cover h-auto"
                src={item.cover.node.sourceUrl}
                alt={item.name}
                width={item.cover.node.mediaDetails?.width}
                height={item.cover.node.mediaDetails?.height}
                loading="lazy"
                decoding="async"
              />
              <div className="px-6 md:pt-6 pt-10 md:pb-8 pb-12 flex flex-col">
                <h3 className="font-bold md:text-lg text-2xl">{item.name}</h3>
                <p className="md:text-[15px] text-base my-6">
                  {item.description}
                </p>
                <ul className="flex justify-between text-[11px] mb-4">
                  <li>{item.features.feature1}</li>
                  <li>{item.features.feature2}</li>
                </ul>
                {/* Every card CTA leads to the contact form */}
                <Button
                  label={item.button.label}
                  variant="secondary"
                  btnSize="0"
                  asLink
                  to="#contactForm"
                />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default OurProduct;
