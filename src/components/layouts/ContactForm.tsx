import useContactFormQuery from "../../hooks/useContactFormQuery";
import Button from "../common/Button";
import FormField from "../common/FormField";
import Section from "../common/Section";

const ContactForm = () => {
  const {
    formData,
    errors,
    submitStatus,
    submitMessage,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  } = useContactFormQuery();

  return (
    <Section
      backgroundColor="dark"
      sectionTitle="Nous Contacter"
      id="contactForm"
    >
      <form
        action=""
        className="flex flex-col gap-6 m-auto lg:max-w-[65%] text-white"
      >
        <FormField
          name="fullName"
          label="Nom Complet *"
          value={formData.fullName}
          error={errors.fullName}
          onChange={handleInputChange}
        />

        <FormField
          name="email"
          type="email"
          label="Courriel *"
          value={formData.email}
          error={errors.email}
          onChange={handleInputChange}
        />

        <FormField
          name="message"
          label="Message *"
          multiline
          fieldClass="h-50 mb-6"
          value={formData.message}
          error={errors.message}
          onChange={handleInputChange}
        />

        {/* Honeypot: hidden from people, filled by bots */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          asLink={false}
          label="Envoyer ton message"
          variant="secondary"
          isLoading={isSubmitting}
          submitStatus={submitStatus}
          submitMessage={submitMessage}
        />
      </form>
    </Section>
  );
};

export default ContactForm;
