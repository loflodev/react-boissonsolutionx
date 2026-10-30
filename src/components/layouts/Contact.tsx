import { MapPin, Store, Truck } from "lucide-react";
import type { JSX } from "react";
import Section from "../common/Section";
interface ContactsType {
  icon: JSX.Element;
  title: string;
  excerpt: string;
}
const Contact = () => {
  const contacts: ContactsType[] = [
    {
      icon: <Truck size={40} color="#fb2c36" aria-hidden="true" />,
      title: "Livraison Garantie",
      excerpt: "SolutionX livrée à votre porte",
    },
    {
      icon: <MapPin size={40} color="#fb2c36" aria-hidden="true" />,
      title: "Localisateur de magasins",
      excerpt: "Trouvez SolutionX chez le détaillant le plus près de chez vous",
    },
    {
      icon: <Store size={40} color="#fb2c36" aria-hidden="true" />,
      title: "Vente en gros",
      excerpt: "Devenez un distributeur de solutionX",
    },
  ];
  return (
    <Section
      backgroundColor="lightgray"
      sectionTitle="Solution locale pour vous"
      id="contact"
    >
      <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] grid-rows-auto gap-8">
        {contacts.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-2xl items-center justify-center px-10 py-14 shadow-2xl gap-6"
          >
            {item.icon}
            <h3 className="font-bold md:text-2xl text-lg">{item.title}</h3>
            <p className="text-base text-center">{item.excerpt}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Contact;
