import Button from "../common/Button";
import Section from "../common/Section";

const About = () => {
  return (
    <Section backgroundColor="white" id="about">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-12 grid-rows-auto items-center">
        <div className="flex flex-col gap-8 px-4 md:px-0">
          <h4 className="text-2xl lg:text-3xl font-bold">Boisson SolutionX</h4>
          <p className="md:text-lg text-xl">
            is simply dummy text of the printing and typesetting industry. Lorem
            Ipsum has been the industry's standard dummy text ever since the
            1500s, when an unknown
            <br />
            <br />
            printer took a galley of type and scrambled it to make a type
            specimen book. It has survived not only five centuries.
          </p>
          <Button
            label="Learn More About us"
            variant="secondary"
            fitContent={false}
          />
        </div>

        <div className="px-4 md:px-0">
          <img src="/about.png" alt="about us image" />
        </div>
      </div>
    </Section>
  );
};

export default About;
