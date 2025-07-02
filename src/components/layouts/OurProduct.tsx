import Button from "../common/Button";
import Section from "../common/Section";

interface OurProducts {
  title: string;
  image: string;
  excerpt: string;
  link: string;
}

const OurProduct = () => {
  const products: OurProducts[] = [
    {
      title: "SolutionX - Betterave",
      image: "/betterave.PNG",
      excerpt:
        "Eau, petit cola, betterave, melon d’eau, fruit de la passion,céléry, persil.",
      link: "#",
    },
    {
      title: "SolutionX - Ginger",
      image: "/ginger.PNG",
      excerpt:
        "Eau, petit cola, gingembre, fruit de la passion, curcuma, céléri, persil.",
      link: "#",
    },
    {
      title: "SolutionX - Hibiscus",
      image: "/hibiscus.PNG",
      excerpt:
        "Eau, petit cola, hibiscus, melon d’eau, fruit de la passion, céléri, persil",
      link: "#",
    },
  ];
  return (
    <Section
      backgroundColor="lightgray"
      sectionTitle="Our Products"
      fullVh={false}
      id="ourProducts"
    >
      <div>
        <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] grid-rows-auto gap-8">
          {products.map((item, index) => (
            <div
              className="item rounded-4xl shadow-2xl"
              key={`${item}-${index}`}
            >
              <div>
                <img
                  className="w-full rounded-tr-4xl rounded-tl-4xl  object-cover"
                  src={item.image}
                  alt={item.title}
                />
              </div>
              <div className="px-10 md:py-8 py-12 flex flex-col gap-6">
                <h4 className="font-bold md:text-lg text-2xl">{item.title}</h4>
                <p className="md:text-lg text-xl">{item.excerpt}</p>
                <Button label="En savoir plus" variant="secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default OurProduct;
