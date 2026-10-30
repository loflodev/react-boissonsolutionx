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
    handleBlur,
    handleSubmit,
  } = useContactFormQuery();

  return (
    <Section
      backgroundColor="dark"
      sectionTitle="Nous Contacter"
      id="contactForm"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 m-auto lg:max-w-[65%] text-white"
      >
        <FormField
          name="fullName"
          label="Nom Complet *"
          autoComplete="name"
          value={formData.fullName}
          error={errors.fullName}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        <FormField
          name="email"
          type="email"
          label="Courriel *"
          autoComplete="email"
          value={formData.email}
          error={errors.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />

        <FormField
          name="message"
          label="Message *"
          multiline
          fieldClass="h-50 mb-6"
          value={formData.message}
          error={errors.message}
          onChange={handleInputChange}
          onBlur={handleBlur}
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
          asLink={false}
          label="Envoyer ton message"
          variant="secondary"
          isLoading={isSubmitting}
          submitStatus={submitStatus}
          submitMessage={submitMessage}
        />

        {/* The button only flashes the result; announce it to screen readers */}
        <p role="status" aria-live="polite" className="sr-only">
          {submitStatus !== "idle" ? submitMessage : ""}
        </p>
      </form>
    </Section>
  );
};

export default ContactForm;
