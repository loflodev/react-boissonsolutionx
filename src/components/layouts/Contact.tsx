import { Mail, MapPin, Phone } from "lucide-react";
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
      icon: <Mail size={40} color="#fb2c36" />,
      title: "Livraison Garantie",
      excerpt: "SolutionX livrée à votre porte",
    },
    {
      icon: <MapPin size={40} color="#fb2c36 " />,
      title: "Localisateur de magasins",
      excerpt: "Trouvez SolutionX chez le détaillant le plus près de chez vous",
    },
    {
      icon: <Phone size={40} color="#fb2c36 " />,
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
        {contacts.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex flex-col rounded-2xl items-center justify-center px-10 py-14 shadow-2xl gap-6"
          >
            {item.icon}
            <h4 className="font-bold md:text-2xl text-lg">{item.title}</h4>
            <p className="text-base text-center">{item.excerpt}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Contact;
