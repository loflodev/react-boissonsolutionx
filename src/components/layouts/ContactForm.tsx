import useContactFormQuery from "../../hooks/useContactFormQuery";
import Button from "../common/Button";
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
        <label htmlFor="fullName" className="flex flex-col gap-2">
          Nom Complet *
          <input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`${errors.fullName ? "border-red-500" : ""} form-input`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </label>

        <label htmlFor="email" className="flex flex-col gap-2">
          Courriel *
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${errors.email ? "border-red-500" : ""} form-input`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </label>

        <label htmlFor="message" className="flex flex-col gap-2">
          Message *
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={`form-input h-50 mb-6 ${
              errors.message ? "border-red-500" : ""
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </label>

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
