import { Glow, Grain, Watermark } from "../common/Decor";
import Reveal from "../common/Reveal";
import Section from "../common/Section";

// Three facts drawn straight from the copy below, surfaced for scanning
const facts = [
  { label: "Ingrédient clé", value: "Noix de kola" },
  { label: "Conservation", value: "Haute pression (HPP)" },
  { label: "Base", value: "Jus de fruits naturels" },
];

const About = () => {
  return (
    <Section
      tone="raised"
      id="about"
      decor={
        <>
          <Glow color="brand" className="right-[-10%] top-1/2 -translate-y-1/2 size-[42rem]" />
          <Watermark
            text="Kola"
            className="-bottom-[0.12em] -right-[0.04em] text-[clamp(10rem,26vw,24rem)]"
          />
          <Grain />
        </>
      }
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">
        <Reveal className="flex flex-col gap-6">
          <p className="eyebrow">02 — Notre histoire</p>
          <h2 className="display text-cream text-[clamp(2.25rem,4.5vw,3.5rem)]">
            Chez Boisson SolutionX
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            Nous avons à cœur la vitalité naturelle et l’énergie de chacun de
            nos consommateurs. Tous nos jus de fruits naturels sont mélangés
            avec du "petit colas", une noix aussi connue sous le nom de "cola
            acuminata" ou "kola nut". Avec son gout unique, authentique et
            revigorant, cet ingrédient central de nos boissons est reconnu pour
            ses bienfaits tonifiants et digestifs. En effet, chaque gorgée de
            nos boissons est un concentré subtil d’un savoir ancestral relié à
            la puissance de la nature.
          </p>
          <p className="text-lg leading-relaxed text-muted">
            Afin de préserver la composition, la saveur et les valeurs
            nutritives de nos produits, le HPP est adopté comme moyen de
            conservation, une méthode qui utilise de l'eau à haute pression afin
            de rendre inactifs les micro-organismes pathogènes sans pour autant
            modifier.
          </p>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 border-t border-line">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="py-5 sm:pr-4 border-b border-line sm:border-b-0"
              >
                <dt className="text-xs uppercase tracking-[0.16em] text-cream/60">
                  {fact.label}
                </dt>
                <dd className="mt-2 font-display text-xl text-cream">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal index={1}>
          <div className="rounded-3xl border border-line bg-white/[0.03] p-2">
            <img
              src="/about.webp"
              alt="Logo SolutionX dans une éclaboussure de jus rouge"
              width={642}
              height={431}
              loading="lazy"
              decoding="async"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default About;
