import useContactFormQuery from "../../hooks/useContactFormQuery";
import Button from "../common/Button";
import { Glow, Grain, Rings } from "../common/Decor";
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
      tone="raised"
      eyebrow="04 — Nous contacter"
      sectionTitle="Nous Contacter"
      id="contactForm"
      decor={
        <>
          <Glow color="secondary" className="right-[5%] top-1/3 size-[30rem]" />
          {/* Rings fill the empty side of the form; on phones there is none, so they stay hidden */}
          <Rings className="hidden md:block top-1/2 -translate-y-1/2 w-[56rem] md:right-[-22rem] lg:right-[-4rem]" />
          <Grain />
        </>
      }
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-2xl rounded-3xl border border-line bg-white/[0.02] p-6 md:p-10"
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
          fieldClass="h-44 resize-y"
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
          variant="primary"
          size="lg"
          fullWidth
          withArrow
          className="mt-2"
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
