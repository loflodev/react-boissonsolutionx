import { MapPin, Store, Truck } from "lucide-react";
import type { JSX } from "react";
import Reveal from "../common/Reveal";
import Section from "../common/Section";
interface ContactsType {
  icon: JSX.Element;
  title: string;
  excerpt: string;
}
const ICON_PROPS = { size: 22, strokeWidth: 1.75, "aria-hidden": true } as const;

const Contact = () => {
  const contacts: ContactsType[] = [
    {
      icon: <Truck {...ICON_PROPS} />,
      title: "Livraison Garantie",
      excerpt: "SolutionX livrée à votre porte",
    },
    {
      icon: <MapPin {...ICON_PROPS} />,
      title: "Localisateur de magasins",
      excerpt: "Trouvez SolutionX chez le détaillant le plus près de chez vous",
    },
    {
      icon: <Store {...ICON_PROPS} />,
      title: "Vente en gros",
      excerpt: "Devenez un distributeur de solutionX",
    },
  ];
  return (
    <Section
      eyebrow="03 — Où acheter"
      sectionTitle="Solution locale pour vous"
      id="contact"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-line md:divide-x divide-line">
        {contacts.map((item, index) => (
          <Reveal
            key={item.title}
            index={index}
            className="flex flex-col gap-5 py-10 md:px-8 md:first:pl-0 md:last:pr-0 border-b border-line last:border-b-0 md:border-b-0"
          >
            <span className="grid size-12 place-items-center rounded-full bg-secondary/10 text-secondary ring-1 ring-secondary/20">
              {item.icon}
            </span>
            <h3 className="display text-cream text-2xl">{item.title}</h3>
            <p className="text-muted leading-relaxed">{item.excerpt}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Contact;
