import useContactFormQuery from "../../hooks/useContactFormQuery";
// import Button from "../common/Button";
import Section from "../common/Section";

const ContactForm = () => {
  const {
    formData,
    errors,
    // submitStatus,
    // submitMessage,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  } = useContactFormQuery();

  return (
    <Section
      backgroundColor="dark"
      sectionTitle="Nous contacter"
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
            className="form-input"
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
            className={`form-input ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
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
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </label>

        {/* <Button label="Envoyer ton message" variant="secondary" /> */}
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={`bg-red-500 text-white hover:bg-red-600 ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          } text-white`}
        >
          Envoyer ton message
        </button>
      </form>
    </Section>
  );
};

export default ContactForm;
