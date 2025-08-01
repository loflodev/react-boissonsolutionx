import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import Section from "../common/Section";
import type { ProductCard } from "../../type";

interface ProductCardProps {
  products: ProductCard[];
}
const OurProduct = ({ products }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleClick = (to: string | undefined) => {
    if (to) navigate(to);
    const section = document.getElementById("contactForm");
    if (section) {
      section.scrollIntoView({ behavior: "instant" });
    }
  };
  return (
    <Section
      backgroundColor="lightgray"
      sectionTitle="Nos Produits"
      fullVh={false}
      id="ourProducts"
    >
      <div>
        <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] grid-rows-auto gap-8">
          {products.map((item, index) => (
            <div
              className="item rounded-4xl shadow-2xl"
              key={`${item.name}-${index}`}
            >
              <div>
                <img
                  className="w-full rounded-tr-4xl rounded-tl-4xl  object-cover"
                  src={item.cover.node.sourceUrl}
                  alt={item.name}
                />
              </div>
              <div className="px-6 md:pt-6 pt-10 md:pb-8 pb-12 flex flex-col">
                <h4 className="font-bold md:text-lg text-2xl">{item.name}</h4>
                <p className="md:text-[15px] text-base my-6">
                  {item.description}
                </p>
                <div className="flex justify-between text-[11px] mb-4">
                  <p>{item.features.feature1}</p>
                  <p>{item.features.feature2}</p>
                </div>
                <Button
                  label={item.button.label}
                  variant="secondary"
                  btnSize="0"
                  onClick={() => handleClick(item.button.link?.url)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default OurProduct;
