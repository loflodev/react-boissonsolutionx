// import Button from "../common/Button";
import Section from "../common/Section";

const About = () => {
  return (
    <Section backgroundColor="white" id="about">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-12 grid-rows-auto items-center">
        <div className="flex flex-col gap-8 px-4 md:px-0">
          <h4 className="text-2xl lg:text-3xl font-bold">
            Chez Boisson SolutionX
          </h4>
          <p className="md:text-lg text-xl">
            Nous avons à cœur la vitalité naturelle et l’énergie de chacun de
            nos consommateurs. Tous nos jus de fruits naturels sont mélangés
            avec du "petit colas", une noix aussi connue sous le nom de "cola
            acuminata" ou "kola nut". Avec son gout unique, authentique et
            revigorant, cet ingrédient central de nos boissons est reconnu pour
            ses bienfaits tonifiants et digestifs. En effet, chaque gorgée de
            nos boissons est un concentré subtil d’un savoir ancestral relié à
            la puissance de la nature.
            <br />
            <br />
            Afin de préserver la composition, la saveur et les valeurs
            nutritives de nos produits, le HPP est adopté comme moyen de
            conservation, une méthode qui utilise de l'eau à haute pression afin
            de rendre inactifs les micro-organismes pathogènes sans pour autant
            modifier.
          </p>
          {/* <Button
            label="En Savoir plus"
            variant="secondary"
            fitContent={false}
          /> */}
        </div>

        <div className="px-4 md:px-0">
          <img src="/about.png" alt="about us image" />
        </div>
      </div>
    </Section>
  );
};

export default About;
