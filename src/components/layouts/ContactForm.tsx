import Button from "../common/Button";
import Section from "../common/Section";

const ContactForm = () => {
  return (
    <Section
      backgroundColor="dark"
      sectionTitle="Get in touch"
      id="contactForm"
    >
      <form
        action=""
        className="flex flex-col gap-6 m-auto lg:max-w-[65%] text-white"
      >
        <label htmlFor="name" className="flex flex-col gap-2">
          Name
          <input type="text" name="name" className="form-input" />
        </label>

        <label htmlFor="email" className="flex flex-col gap-2">
          Email
          <input type="text" name="email" className="form-input" />
        </label>

        <label htmlFor="message" className="flex flex-col gap-2">
          Message
          <textarea name="message" className="form-input h-50 mb-6" />
        </label>

        <Button label="Send message" variant="secondary" />
      </form>
    </Section>
  );
};

export default ContactForm;
